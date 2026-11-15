/* Four true jigsaws with locally drawn, curved puzzle pieces and no picture previews.
   Source pictures are original illustrations created for this project, plus the
   user-provided bonus photo; there are no external requests or libraries. */
(() => {
  'use strict';
  const levels = [
    { label: '100-piece mystery', pieces: 100, cols: 10, rows: 10, picture: '../../assets/cutie-reveal-100.webp', alt: 'Our illustrated sunset walk, holding hands among pink flowers' },
    { label: '200-piece mystery', pieces: 200, cols: 20, rows: 10, picture: '../../assets/cutie-reveal-200.webp', alt: 'A cozy illustrated cuddle in bed, holding two mugs of hot cocoa' },
    { label: '300-piece mystery', pieces: 300, cols: 25, rows: 12, picture: '../../assets/cutie-reveal-300.webp', alt: 'Our illustrated chalk-art date drawing hearts outside' },
    { label: '400-piece bonus', pieces: 400, cols: 16, rows: 25, picture: '../../assets/cutie-reveal-bonus.webp', alt: 'The surprise funny filtered selfie you chose for the bonus' }
  ];

  const $ = id => document.getElementById(id);
  const menu = $('cutie-menu'), choices = $('cutie-desktop-choices');
  const game = $('cutie-game'), board = $('cutie-board'), boardScroll = $('cutie-board-scroll');
  const tray = $('cutie-tray'), feedback = $('cutie-feedback');
  const progressLabel = $('cutie-progress-label'), progressFill = $('cutie-progress-fill');
  const win = $('cutie-win'), winImage = $('cutie-win-image');
  if (!menu || !choices || !game || !board || !tray) return;

  let config = null, levelIndex = -1, image = null, placed = new Set();
  let selected = null, currentZoom = 1, slotElements = [], pieceElements = new Map();
  let horizontalEdges = [], verticalEdges = [], resizeJob, hintTimer, dragState = null;
  let seed = 35112026;
  const rand = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
  const shuffle = items => { for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; } return items; };
  const storageKey = index => 'cutie-secret-puzzle-v1-' + levels[index].pieces;

  function revealStatus(message) { feedback.textContent = message; }
  function saveProgress() { try { localStorage.setItem(storageKey(levelIndex), JSON.stringify([...placed])); } catch (_) {} }
  function loadProgress() {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey(levelIndex)) || '[]');
      if (Array.isArray(raw)) return new Set(raw.filter(n => Number.isInteger(n) && n >= 0 && n < config.pieces));
    } catch (_) {}
    return new Set();
  }
  function menuLayout() {
    if (menu.hidden) return;
    const w = menu.clientWidth, h = menu.clientHeight;
    const scaleX = w / 1672, scaleY = h / 941;
    const rectangles = [[206, 135, 794, 484], [839, 132, 1447, 484], [205, 501, 796, 900], [841, 491, 1449, 901]];
    const targets = [...choices.querySelectorAll('[data-puzzle]')];
    targets.forEach((node, i) => {
      const [x1, y1, x2, y2] = rectangles[i];
      node.style.left = x1 * scaleX + 'px';
      node.style.top = y1 * scaleY + 'px';
      node.style.width = (x2 - x1) * scaleX + 'px';
      node.style.height = (y2 - y1) * scaleY + 'px';
    });
    const back = $('cutie-desktop-back');
    back.style.left = 23 * scaleX + 'px';
    back.style.top = 18 * scaleY + 'px';
    back.style.width = 192 * scaleX + 'px';
    back.style.height = 80 * scaleY + 'px';
  }

  function buildEdges() {
    // Every neighboring pair shares an edge profile with opposite protrusion.
    seed = 81322 + config.pieces;
    horizontalEdges = Array.from({length: config.rows - 1}, () => Array.from({length: config.cols}, () => rand() < .5 ? 1 : -1));
    verticalEdges = Array.from({length: config.rows}, () => Array.from({length: config.cols - 1}, () => rand() < .5 ? 1 : -1));
  }
  function outline(ctx, id, width, height) {
    const row = Math.floor(id / config.cols), col = id % config.cols;
    const top = row === 0 ? 0 : -horizontalEdges[row-1][col];
    const bottom = row === config.rows-1 ? 0 : horizontalEdges[row][col];
    const left = col === 0 ? 0 : -verticalEdges[row][col-1];
    const right = col === config.cols-1 ? 0 : verticalEdges[row][col];
    const edge = (x1,y1,x2,y2,sign) => {
      const dx=x2-x1,dy=y2-y1, nx=dy/Math.hypot(dx,dy), ny=-dx/Math.hypot(dx,dy);
      const point=(t,offset=0) => [x1+dx*t+nx*offset,y1+dy*t+ny*offset];
      if (!sign) { ctx.lineTo(x2,y2); return; }
      const bulb = Math.min(width,height)*.22*sign;
      const line=(t,b=0)=>{const [x,y]=point(t,b);ctx.lineTo(x,y);};
      const curve=(a,b,c)=>{const p=point(a[0],a[1]),q=point(b[0],b[1]),r=point(c[0],c[1]);ctx.bezierCurveTo(...p,...q,...r);};
      line(.27);
      curve([.34,0],[.36,bulb*.13],[.35,bulb*.33]);
      curve([.28,bulb*.93],[.43,bulb*1.18],[.50,bulb*1.16]);
      curve([.57,bulb*1.18],[.72,bulb*.93],[.65,bulb*.33]);
      curve([.64,bulb*.13],[.66,0],[.73,0]);
      line(1);
    };
    ctx.beginPath(); ctx.moveTo(0,0);
    edge(0,0,width,0,top); edge(width,0,width,height,right);
    edge(width,height,0,height,bottom); edge(0,height,0,0,left);
    ctx.closePath();
  }

  function paintPiece(id) {
    const size = 82, pad = Math.round(size * .24), c = document.createElement('canvas');
    c.width = c.height = size + pad * 2;
    const ctx = c.getContext('2d');
    const row = Math.floor(id / config.cols), col = id % config.cols;
    ctx.translate(pad, pad);
    outline(ctx,id,size,size);
    ctx.save();ctx.clip();
    const sliceW = image.naturalWidth/config.cols, sliceH = image.naturalHeight/config.rows;
    // Draw only the relevant source-image rectangle instead of resampling the
    // complete image hundreds of times. The surrounding margin holds the tabs.
    ctx.drawImage(image,(col-pad/size)*sliceW,(row-pad/size)*sliceH,
      (1+pad*2/size)*sliceW,(1+pad*2/size)*sliceH,
      -pad,-pad,size+pad*2,size+pad*2);
    ctx.restore();
    ctx.strokeStyle='rgba(255,244,224,.94)';ctx.lineWidth=1.8;
    ctx.shadowColor='rgba(89,24,73,.7)';ctx.shadowBlur=2.1;ctx.stroke();
    return c;
  }

  function boardLayout() {
    if (!config || game.hidden) return;
    const maxWidth = Math.max(260, boardScroll.clientWidth - 45);
    const maxHeight = Math.max(260, boardScroll.clientHeight - 45);
    const cell = Math.max(12, Math.min(72, Math.floor(maxWidth/config.cols), Math.floor(maxHeight/config.rows)));
    const pieceSize = cell * currentZoom;
    board.style.width = (pieceSize * config.cols) + 'px';
    board.style.height = (pieceSize * config.rows) + 'px';
    board.style.gridTemplateColumns = `repeat(${config.cols}, minmax(0, 1fr))`;
    board.style.gridTemplateRows = `repeat(${config.rows}, minmax(0, 1fr))`;
    $('cutie-zoom-label').textContent = Math.round(currentZoom * 100) + '%';
    $('cutie-zoom-out').disabled = currentZoom <= .8;
    $('cutie-zoom-in').disabled = currentZoom >= 3;
  }

  function updateProgress() {
    progressLabel.textContent = `${placed.size} / ${config.pieces}`;
    progressFill.style.width = (placed.size/config.pieces*100).toFixed(2) + '%';
  }

  function buildBoard() {
    board.replaceChildren(); slotElements=[];
    const frag = document.createDocumentFragment();
    for (let i=0;i<config.pieces;i++) {
      const slot=document.createElement('button');
      slot.type='button'; slot.className='cutie-slot';slot.dataset.slot=String(i);
      slot.setAttribute('aria-label',`Empty spot, row ${Math.floor(i/config.cols)+1}, column ${i%config.cols+1}`);
      slot.addEventListener('click', () => onSlot(i));
      slotElements.push(slot);frag.appendChild(slot);
    }
    board.appendChild(frag);
    boardLayout();
  }

  function makeTile(id) {
    const button=document.createElement('button');button.type='button';
    button.className='cutie-piece';button.dataset.piece=String(id);
    button.setAttribute('aria-label',`Choose puzzle piece ${id+1}`);
    button.setAttribute('aria-pressed','false');
    button.appendChild(paintPiece(id));
    button.addEventListener('click',e=>{
      if (button.dataset.skipClick==='yes') {button.dataset.skipClick='';e.preventDefault();return;}
      selectPiece(id);
    });
    setupDrag(button,id);
    pieceElements.set(id,button);
    return button;
  }

  function buildTray() {
    tray.replaceChildren();pieceElements.clear();
    const all=Array.from({length:config.pieces},(_,i)=>i);
    const frag=document.createDocumentFragment();
    shuffle(all.filter(i=>!placed.has(i))).forEach(id=>frag.appendChild(makeTile(id)));
    tray.appendChild(frag);
    // Transfer completed pieces to their corresponding board positions.
    for (let i=0;i<config.pieces;i++) if (placed.has(i)) {
      const canvas=paintPiece(i),slot=slotElements[i];
      slot.appendChild(canvas);slot.classList.add('is-filled');
      slot.setAttribute('aria-label',`Completed spot, row ${Math.floor(i/config.cols)+1}, column ${i%config.cols+1}`);
    }
  }

  function selectPiece(id) {
    if (placed.has(id)) return;
    if (selected!==null) {
      const old=pieceElements.get(selected);
      if (old) {old.classList.remove('is-selected');old.setAttribute('aria-pressed','false');}
    }
    selected=selected===id?null:id;
    if (selected!==null) {
      const node=pieceElements.get(selected);
      if(node){node.classList.add('is-selected');node.setAttribute('aria-pressed','true');}
      revealStatus('Find the spot for your selected piece, or tap Find my spot for a hint.');
    } else revealStatus('Pick a piece, then find where it belongs.');
  }

  function onSlot(id) {
    if (placed.has(id)) return;
    if (selected===null) {revealStatus('Choose a piece from the tray first.');return;}
    if (id!==selected) {
      const slot=slotElements[id];
      slot.classList.remove('is-wrong');void slot.offsetWidth;slot.classList.add('is-wrong');
      revealStatus('Not quite! Try another spot, or ask for a hint.');
      return;
    }
    fitPiece(id);
  }

  function fitPiece(id) {
    if (placed.has(id) || !config) return;
    const button=pieceElements.get(id),slot=slotElements[id];
    if (!button || !slot) return;
    const canvas=button.querySelector('canvas');
    slot.appendChild(canvas);
    slot.classList.add('is-filled');
    slot.setAttribute('aria-label',`Completed spot, row ${Math.floor(id/config.cols)+1}, column ${id%config.cols+1}`);
    button.remove();pieceElements.delete(id);placed.add(id);
    if (selected===id) selected=null;
    clearTimeout(hintTimer);slotElements.forEach(el=>el.classList.remove('is-hinted'));
    updateProgress();saveProgress();
    revealStatus(placed.size===config.pieces ? 'Every piece fits. You unlocked your surprise!' : `Beautiful! ${placed.size} of ${config.pieces} pieces together.`);
    if (placed.size===config.pieces) window.setTimeout(showWin,650);
  }

  function setupDrag(button,id) {
    let gesture=null;
    button.addEventListener('pointerdown',event=>{
      if (event.button!==0 || placed.has(id)) return;
      gesture={startX:event.clientX,startY:event.clientY,moved:false,ghost:null};
      try{button.setPointerCapture(event.pointerId);}catch(_){}
    });
    button.addEventListener('pointermove',event=>{
      if(!gesture) return;
      const delta=Math.hypot(event.clientX-gesture.startX,event.clientY-gesture.startY);
      if(!gesture.moved&&delta<10) return;
      if(!gesture.moved){
        gesture.moved=true;
        const ghost=document.createElement('div');ghost.className='cutie-drag-ghost';
        const copied=document.createElement('canvas'),original=button.querySelector('canvas');
        copied.width=original.width;copied.height=original.height;
        copied.getContext('2d').drawImage(original,0,0);
        ghost.appendChild(copied);document.body.appendChild(ghost);
        button.classList.add('is-dragging');gesture.ghost=ghost;
      }
      gesture.ghost.style.left=event.clientX+'px';gesture.ghost.style.top=event.clientY+'px';
    });
    const finish=event=>{
      if(!gesture) return;
      const moved=gesture.moved;
      if(gesture.ghost)gesture.ghost.remove();button.classList.remove('is-dragging');
      gesture=null;
      if(!moved) return;
      button.dataset.skipClick='yes';
      const under=document.elementFromPoint(event.clientX,event.clientY);
      const slot=under&&under.closest&&under.closest('.cutie-slot');
      if(slot){
        const target=Number(slot.dataset.slot);
        if(target===id)fitPiece(id);
        else {selectPiece(id);onSlot(target);}
      }else{selectPiece(id);revealStatus('Try dropping the piece onto the puzzle board.');}
    };
    button.addEventListener('pointerup',finish);
    button.addEventListener('pointercancel',()=>{
      if(!gesture)return;
      if(gesture.ghost)gesture.ghost.remove();
      button.classList.remove('is-dragging');gesture=null;
    });
  }

  function showWin() {
    if(!config || placed.size!==config.pieces)return;
    winImage.src=config.picture;
    winImage.alt=config.alt;
    $('cutie-win-heading').textContent=levelIndex===3 ? 'Bonus unlocked!' : 'You did it!';
    win.hidden=false;
    $('cutie-win-menu').focus({preventScroll:true});
  }

  function closeWin() {win.hidden=true;winImage.removeAttribute('src');}
  function openMenu() {
    closeWin();config=null;levelIndex=-1;image=null;selected=null;
    game.hidden=true;menu.hidden=false;
    board.replaceChildren();tray.replaceChildren();
    menuLayout();
  }
  async function startLevel(index) {
    if (!Number.isInteger(index) || !levels[index]) return;
    config=levels[index];levelIndex=index;image=null;selected=null;
    currentZoom=1;
    placed=loadProgress();
    menu.hidden=true;game.hidden=false;
    $('cutie-game-level').textContent=config.label;
    revealStatus('Preparing your mystery pieces...');
    win.hidden=true;
    const nextImage=new Image();nextImage.decoding='async';
    try{
      nextImage.src=config.picture;
      await nextImage.decode();
    }catch(_){
      revealStatus('The puzzle image did not load. Try refreshing this page.');return;
    }
    // Another level may have been selected while loading.
    if(levels[index]!==config)return;
    image=nextImage;
    buildEdges();buildBoard();buildTray();updateProgress();
    revealStatus('Pick a piece, then find where it belongs.');
    if(placed.size===config.pieces)showWin();
  }

  document.querySelectorAll('[data-puzzle]').forEach(button=>button.addEventListener('click',()=>startLevel(Number(button.dataset.puzzle))));
  $('cutie-back-game').addEventListener('click',openMenu);
  $('cutie-win-menu').addEventListener('click',openMenu);
  $('cutie-win-again').addEventListener('click',()=>{
    if(!config)return;const index=levelIndex;
    try{localStorage.removeItem(storageKey(index));}catch(_){}
    closeWin();startLevel(index);
  });
  $('cutie-hint').addEventListener('click',()=>{
    if(!config)return;
    if(selected===null){
      const first=pieceElements.keys().next().value;
      if(first===undefined)return;
      selectPiece(first);
    }
    if(selected===null)return;
    slotElements.forEach(el=>el.classList.remove('is-hinted'));
    const slot=slotElements[selected];slot.classList.add('is-hinted');
    slot.scrollIntoView({block:'nearest',inline:'nearest',behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
    revealStatus('There is your piece’s spot!');
    clearTimeout(hintTimer);hintTimer=setTimeout(()=>slot.classList.remove('is-hinted'),3100);
  });
  $('cutie-shuffle').addEventListener('click',()=>{
    if(!config)return;
    const pieces=shuffle([...tray.children]);
    pieces.forEach(el=>tray.appendChild(el));
    revealStatus('The remaining pieces have been shuffled.');
  });
  $('cutie-reset').addEventListener('click',()=>{
    if(!config || !window.confirm('Start this puzzle over? Its saved progress will be cleared.'))return;
    const index=levelIndex;
    try{localStorage.removeItem(storageKey(index));}catch(_){}
    startLevel(index);
  });
  function zoomBy(delta){
    if(!config)return;
    currentZoom=Math.min(3,Math.max(.8,Math.round((currentZoom+delta)*10)/10));
    boardLayout();
  }
  $('cutie-zoom-in').addEventListener('click',()=>zoomBy(.3));
  $('cutie-zoom-out').addEventListener('click',()=>zoomBy(-.3));
  window.addEventListener('resize',()=>{
    clearTimeout(resizeJob);
    resizeJob=setTimeout(()=>{menuLayout();if(config)boardLayout();},100);
  },{passive:true});
  document.addEventListener('keydown',event=>{
    if(win.hidden)return;
    if(event.key==='Tab'){
      const first=$('cutie-win-again'),last=$('cutie-win-menu');
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  menuLayout();
})();
