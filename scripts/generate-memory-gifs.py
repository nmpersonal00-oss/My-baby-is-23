#!/usr/bin/env python3
"""Produce cinematic 3D GIF clues keyed by the game's exact answers.

The generator is deliberately manual (GitHub Actions workflow_dispatch), uses
paid OpenAI API credits, and stages changes in a review pull request. It will
never alter the original Hollow Knight category, and never substitutes a random
asset when rendering or independent visual review fails.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import os
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / 'assets/memory-gif-inventory.json'
WIDTH, HEIGHT, FRAMES, DELAY = 480, 210, 6, 180
MODEL = 'gpt-image-2.6-sunburst'
AUDITOR = 'gpt-5.4-mini'

WORLD = {
    'sanrio': 'Sanrio official character universe; rounded mascot proportions, gentle bright personalities, rendered as faithful collectible 3D CGI against the dark purple enchanted forest',
    'silksong': 'Hollow Knight: Silksong, the 2D metroidvania set in Pharloom; preserve the iconic insect-world creature designs and stylized silhouettes in high-end 3D',
    'colossus': 'Shadow of the Colossus (PlayStation); vast ancient ruins, enormous stone-and-fur colossi, desaturated naturalistic cinematic 3D',
    'lies-of-p': 'Lies of P; Belle Époque steampunk Krat city, polished realistic Victorian costumes, eerie puppets, dark fantasy CGI',
    'terraria': 'Terraria the video game; depict the exact recognizable NPC, enemy, tool, or biome, translated from pixel sprites into rich cinematic 3D',
    'dark-souls': 'Dark Souls I and II video games; exact iconic armor, enemies, weapons, locations, mystical dark medieval fantasy, cinematic realistic CG',
    'bloodborne': 'Bloodborne the video game; eldritch horror in Gothic Victorian Yharnam, signature hunter outfits, bosses and locations, cinematic realistic CG',
}

# Known identity cues for commonly confused subjects. Names not listed still get
# their original-game context. Ambiguous cues can be augmented with an official
# reference image next to the answer's inventory GIF path under refs/<category>.
HINTS = {
    'sanrio': {
        'Badtz-Maru': 'black mischievous spiky-headed penguin, white oval belly, yellow beak and feet, half-lidded white eyes',
        'Jimmy': 'human blond boy from Patty & Jimmy, huge curly yellow hair, little dark dot eyes, blue shirt with white J, shorts, blue shoes; NOT a rabbit',
        'Pekkle': 'Ahiru no Pekkle, round white duck with three tiny dark head tufts, broad yellow bill, blue collared shirt and orange webbed feet',
        'Kirimichan': 'tiny smiling pink-orange salmon fillet slice with fish skin, tiny face and feet; NOT a rabbit',
        'My Melody': 'white rabbit with a pink hood, a floppy rabbit ear and small bow or flower, white face and yellow nose',
        'Sanrio Puroland': 'real indoor Sanrio Puroland theme park fantasy palace aesthetic with warmly lit grand entrance; LOCATION, no foreground mascot',
        'Pompompurin': 'round golden-yellow retriever dog with long floppy ears and a small dark brown beret, no outfit; NOT My Melody',
        'Cinnamoroll': 'tiny white puppy, exceptionally long sideways flying soft ears, blue oval eyes, pink cheeks, tiny curled tail',
        'Pochacco': 'white puppy with black floppy ears, black dot eyes and simple sporty casual outfit; NOT Cinnamoroll',
        'Sugarbunnies': 'TWO bakery bunny friends, one white rabbit one pale brown rabbit with chef caps, sweet baking scene',
        'Hello Kitty': 'white bobtail cat, large oval face, black oval eyes, yellow nose, no mouth, red left-ear bow',
        'Dear Daniel': 'male white cat with a small swoop of hair, large dark oval eyes and yellow nose, often wearing blue',
        'Kuromi': 'white bunny face under a black jester hood with pointed ears, pink skull on forehead, impish expression',
        'Keroppi': 'bright green cartoon frog with very large round white eyes and red-and-white striped shirt',
        'Chococat': 'small black cat with large white eyes, pointed ears, long whiskers, tiny chocolate brown nose, blue collar',
        'Kiki': 'Little Twin Stars blue-haired boy in a blue celestial outfit',
        'Lala': 'Little Twin Stars pink-haired girl in a pale pink celestial dress',
        'Tuxedosam': 'round blue penguin with white face and tummy, pink bow tie, little sailor cap',
        'Hangyodon': 'blue fish-like character with big bulging eyes, fish lips and short arms',
        'Mimmy': 'white kitten like Hello Kitty but with a YELLOW bow on the opposite ear',
        'Gudetama': 'unmotivated lazy golden egg yolk character slumped on a white egg white',
        'Patty': 'human blond girl from Patty & Jimmy, simple dot eyes and bright retro outfits',
        'Aggretsuko': 'red panda Retsuko working in an office, kawaii character, not a rabbit',
        'Retsuko': 'red panda office worker with reddish-orange and white face markings',
        'Fenneko': 'small cream-colored fennec fox coworker from Aggretsuko with huge ears',
        'Director Ton': 'Aggretsuko office director, rotund red-brown pig / boar salaryman in suit',
        'Director Gori': 'Aggretsuko gorilla executive businesswoman in work clothes',
        'Sanrio Character Ranking': 'annual Sanrio popularity ranking celebrated with recognizable Sanrio character displays, no text labels',
        'Hello Kitty’s red bow': 'the iconic large scarlet ribbon bow with gold-lit fabric detail, object only, not the full character',
        'Café Cinnamon': 'Cinnamoroll themed Café Cinnamon café interior in pastel soft blues, bread and cafe pastries',
        'Sanrio Puroland': 'a magical theme park inspired by Sanrio Puroland entrance architecture and indoor fantasy kingdom, no foreground character',
    },
    'lies-of-p': {
        'Pinocchio': 'pale black-haired young man in cobalt Victorian tailcoat, white frilled cravat, intricate mechanical Legion Arm',
        'Krat': 'rain-slick dark Victorian European steampunk city with clock towers, tram rails and electric lamps',
        'Hotel Krat': 'ornate stately gothic Belle Époque hotel interior with gilded arches, sweeping staircase and chandeliers',
        'Stargazer': 'distinctive blue-glowing ornate steampunk brass Stargazer checkpoint device',
        'Puppet String': 'mechanical retractable grappling tether launcher used in Lies of P',
        'Legion Arm': 'complex metal prosthetic arm mounted with mechanisms and blue energy',
    },
    'terraria': {
        'King Slime': 'giant translucent blue jelly blob with simple eyes and large GOLDEN CROWN; absolutely no rabbit',
        'Eye of Cthulhu': 'giant floating demonic eyeball, red iris, blood vessels and writhing tendrils',
        'Skeletron': 'floating giant skull with skeletal arms and bony hands',
        'Guide': 'Terraria Guide NPC, red-brown hair, green short-sleeve shirt and blue pants, not a generic tour guide',
        'Merchant': 'Terraria merchant NPC with blue shirt, glasses, short brown hair and goatee',
        'Moon Lord': 'Terraria Moon Lord boss, enormous blue-green Cthulhu-like cosmic entity with multiple eyes and open torso eye',
        'Zenith': 'Terraria Zenith, a glowing sword with prismatic arcs and multiple spectral blades',
    },
    'dark-souls': {
        'Solaire of Astora': 'warrior of sunlight with iconic bucket-shaped helmet, white tabard with painted yellow sun, straight sword and round shield',
        'Siegmeyer of Catarina': 'onion-shaped bulbous metallic silver knight armor and round layered helmet',
        'Great Grey Wolf Sif': 'enormous grey wolf carrying an oversized greatsword sideways in its jaws',
        'Firelink Shrine': 'ruined ancient stone sanctuary with warm bonfire and overgrown gray arches',
        'Estus Flask': 'vintage glass flask with glowing molten orange healing liquid, iconic Dark Souls',
    },
    'bloodborne': {
        'The Hunter': 'long black leather hunter coat, tricorn hat, pale scarf over face, iconic saw cleaver and flintlock pistol',
        'Father Gascoigne': 'tall hunter priest in dark coat and floppy brimmed hat wielding hunter axe in gothic graveyard',
        'Cleric Beast': 'enormous pale-furred antlered grotesque skeletal beast with elongated limbs in Victorian city',
        'Blood Vial': 'tall narrow dark red medicinal glass blood vial on a moonlit Gothic table',
        'Yharnam': 'distinct Gothic Victorian city of Yharnam with spires, iron railings and pale moon',
    },
    'colossus': {
        'Wander': 'young man with dark hair and poncho-like cloak carrying ancient sword and bow, in vast grassland ruins',
        'Agro': 'large black horse companion to Wander, distinct white facial blaze',
        'Valus': 'first colossal upright stone-and-fur giant with club and geometric runic armor',
        'Quadratus': 'four-legged enormous armored stone colossus with massive stomping hooves',
        'Ancient Sword': 'long ancient runic sword reflecting concentrated beams of white sunlight in high fantasy ruins',
    },
    'silksong': {
        'Sherma': 'small horned insect pilgrim from Hollow Knight Silksong, greenish hood and staff',
        'Garmond': 'cavalier insect knight traveling with his companion Zaza in Hollow Knight Silksong',
        'Needolin': 'Hornet playing the needle-shaped musical tool, enchanting lines of silk and melody',
        'Pharloom': 'wide magical ancient insect kingdom of Pharloom with towering vertical architecture and silk',
        'Bonebottom': 'inhabited bone-and-moss village in the ruins of Silksong',
    },
}


def type_of(category: str, index: int, name: str) -> str:
    if category == 'sanrio':
        return 'character' if index < 38 else 'place, group, or symbolic object'
    if category == 'terraria':
        return 'nonplayer character' if index < 15 else ('boss monster' if index < 30 else 'item, area, or game mechanic')
    if category == 'bloodborne':
        return 'person' if index < 15 else ('boss monster' if index < 30 else 'place, weapon, or concept')
    if category == 'silksong':
        return 'character' if index < 8 else ('boss monster' if index < 22 else ('ability or equipment' if index < 36 else 'location'))
    if category == 'colossus' and ('Bridge' in name or 'Lands' in name or 'Shrine' in name):
        return 'place'
    return 'named game character, location, boss, item, or concept'


def prompt(category: str, name: str, index: int) -> str:
    hint = HINTS.get(category, {}).get(name)
    return (f'Create exactly ONE premium CINEMATIC 3D ANIMATED GIF clue for a memory-matching game. '
            f'The answer is "{name}" from {WORLD[category]}. The exact subject is a {type_of(category,index,name)}. '
            + (f'Canonical appearance requirements: {hint}. ' if hint else
               f'Depict the SPECIFIC official subject named "{name}" from the named game or brand, using its authentic recognized silhouette, colors, costume, proportions, equipment and setting—not a generic fantasy substitute. ')
            + 'A uniquely identifiable character, scene, or object is the dominant foreground subject and MUST be correct for the answer. '
              'Do not reuse a different character, especially not a pink bunny or generic sticker. '
              'Use film-quality physically based materials and lighting, original 3D composition, subtle depth of field, expressive natural action, no flat vector art, no pixel art. '
              'A subtle natural six-frame loop: blink, wave, move gently, or sway as appropriate to the subject; for architecture, shimmer of lights, mist, or moving fabric. '
              'Keep character anatomy, face, costume and camera position stable through all frames. '
              'The composition is a landscape 16:7 card, subject centered, fully identifiable even at 480x210. '
              'No words, answer text, subtitles, watermarks, logos, or decorative card borders. '
              'Stay within the visual style of this category and never draw a completely unrelated franchise mascot.')


def verify_gif(blob: bytes) -> list[Image.Image]:
    try:
        img = Image.open(io.BytesIO(blob))
    except Exception as exc:
        raise ValueError('Image API did not produce a decodable GIF') from exc
    if img.format != 'GIF' or getattr(img, 'n_frames', 1) < 2:
        raise ValueError('Image API output is not animated GIF')
    out = []
    for frame in range(img.n_frames):
        img.seek(frame)
        im = img.convert('RGB')
        out.append(im.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS))
    return out


def audit(client, category: str, name: str, frames: list[Image.Image]) -> tuple[bool, str]:
    # An independent visual read, not merely checking filenames or prompts.
    mid = frames[len(frames) // 2]
    buf = io.BytesIO()
    mid.save(buf, format='JPEG', quality=88)
    image_url = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')
    question = (f'Independently examine this rendered picture. The target is EXACTLY "{name}" from '
                f'{WORLD[category]}. Is the main pictured subject recognizably that target? '
                'Compare iconic features and source identity; reject generic imagery, wrong franchise or a different named character. '
                'Do not give credit for correct background, file name or caption. '
                'Answer with exactly one line: PASS if highly confident in the visual identity, else FAIL, followed by a short reason.')
    result = client.responses.create(model=AUDITOR, input=[{'role': 'user', 'content': [
        {'type': 'input_text', 'text': question}, {'type': 'input_image', 'image_url': image_url}
    ]}])
    verdict = (result.output_text or '').strip()
    return verdict.upper().startswith('PASS '), verdict[:450]


def save_gif(frames: list[Image.Image], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.tmp.gif')
    frames[0].save(temp, format='GIF', save_all=True, append_images=frames[1:],
                   loop=0, duration=DELAY, disposal=2, optimize=True)
    with Image.open(temp) as check:
        if check.size != (WIDTH, HEIGHT) or check.n_frames < 2:
            temp.unlink(missing_ok=True)
            raise ValueError('Final GIF has wrong geometry or lost animation')
        for i in range(check.n_frames):
            check.seek(i)
            check.load()
    temp.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--category', default='sanrio', choices=sorted(WORLD) + ['all'])
    parser.add_argument('--start', type=int, default=0, help='0-based index within category')
    parser.add_argument('--limit', type=int, default=10, help='number of names to generate per category')
    parser.add_argument('--generate', action='store_true', help='actually spend API credits; default prints plan only')
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--attempts', type=int, default=2)
    args = parser.parse_args()
    if args.start < 0 or args.limit < 1 or args.limit > 50 or args.attempts not in (1,2,3):
        parser.error('start >= 0, 1 <= limit <= 50, 1 <= attempts <= 3 required')
    inventory = json.loads(INVENTORY.read_text(encoding='utf-8'))
    if inventory.get('excluded_category') != 'hollow-knight':
        raise ValueError('Hollow Knight exclusion guard is missing')
    targets = []
    for category, group in inventory['categories'].items():
        if category == 'hollow-knight':
            raise ValueError('Hollow Knight must not be in generation inventory')
        if args.category != 'all' and category != args.category:
            continue
        if len(group['answers']) != 50:
            raise ValueError(f'Expected 50 answers in {category}')
        for index in range(args.start, min(50, args.start + args.limit)):
            entry = group['answers'][index]
            target = ROOT / entry['path']
            if target.is_file() and not args.force:
                continue
            targets.append((category, index, entry['name'], target))
    if not targets:
        print('All requested answer GIFs already exist.'); return 0
    print(f'Planning {len(targets)} exact-title GIFs; API charges incurred only with --generate.')
    if not args.generate:
        for category, index, name, target in targets:
            print(f'{category} #{index + 1:02d}: {name} -> {target.relative_to(ROOT)}')
        return 0
    if not os.environ.get('OPENAI_API_KEY'):
        raise RuntimeError('OPENAI_API_KEY is required in GitHub Actions Secrets for paid generation')
    from openai import OpenAI
    client = OpenAI(timeout=180, max_retries=2)
    produced, rejected = 0, []
    for category, index, name, target in targets:
        print(f'Rendering {category}: {name}', flush=True)
        last_reason = ''
        for attempt in range(1, args.attempts + 1):
            try:
                # Optional source reference: for obscure named characters, add
                # assets/memory-gif-references/<category>/<slug>.png and use an
                # actual image edit so distinctive features are preserved.
                ref = ROOT / 'assets' / 'memory-gif-references' / category / (target.stem + '.png')
                arguments = dict(model=MODEL, prompt=prompt(category,name,index),
                                 output_format='gif', size='768x336', n=1,
                                 frame_count=FRAMES, frame_duration_ms=DELAY,
                                 quality='high')
                if ref.is_file():
                    with ref.open('rb') as original:
                        req = client.images.edit(image=original, **arguments)
                else:
                    req = client.images.generate(**arguments)
                frames = verify_gif(base64.b64decode(req.data[0].b64_json))
                matched, reason = audit(client,category,name,frames)
                print(f'  QA attempt {attempt}: {reason}', flush=True)
                if not matched:
                    last_reason = reason
                    continue
                save_gif(frames,target)
                produced += 1
                break
            except Exception as exc:
                last_reason = f'{type(exc).__name__}: {exc}'
                print(f'  attempt {attempt} failed: {last_reason}', flush=True)
        else:
            rejected.append({'category':category,'name':name,'reason':last_reason})
    report = ROOT / 'memory-gif-generation-report.json'
    report.write_text(json.dumps({'generated':produced,'rejected':rejected},indent=2,ensure_ascii=False))
    print(f'Complete: {produced} new visually audited GIFs; {len(rejected)} rejected/missing. Original Hollow Knight untouched.')
    return 0 if not rejected else 2

if __name__ == '__main__':
    sys.exit(main())