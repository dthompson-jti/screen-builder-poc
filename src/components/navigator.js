// src/navigator.js
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

export class NodeNavigator {
  constructor(mountElement) {
    this.container = mountElement;
    this.viewport = this.container.querySelector('#nodes-viewport');
    this.track = this.container.querySelector('#nodes-track');
    
    this.duration = 0.4;
    this.ease = 'power3.inOut';
    this.poolSize = 7;

    this.nodeData = [];
    this.selectedIndex = 0;
    this.isAnimating = false;
    this.elementPool = [];

    this.layout = { slotWidth: 0, gap: 0, slideDistance: 0 };
    this.colors = {
        selectedBg: getComputedStyle(document.documentElement).getPropertyValue('--control-bg-selected').trim(),
        selectedBorder: getComputedStyle(document.documentElement).getPropertyValue('--control-border-selected').trim(),
        selectedColor: getComputedStyle(document.documentElement).getPropertyValue('--control-fg-selected').trim(),
        defaultBg: getComputedStyle(document.documentElement).getPropertyValue('--control-bg-secondary').trim(),
        defaultBorder: getComputedStyle(document.documentElement).getPropertyValue('--control-border-secondary').trim(),
        defaultColor: getComputedStyle(document.documentElement).getPropertyValue('--control-fg-primary').trim(),
        disabledBg: getComputedStyle(document.documentElement).getPropertyValue('--control-bg-disabled_subtle').trim(),
        disabledBorder: getComputedStyle(document.documentElement).getPropertyValue('--control-border-disabled').trim(),
        disabledColor: getComputedStyle(document.documentElement).getPropertyValue('--control-fg-disabled').trim(),
    };
  }

  init(initialNodeId, nodeData) {
    this.nodeData = nodeData;
    const initialIndex = this.nodeData.findIndex(n => n.id === initialNodeId);
    this.selectedIndex = initialIndex !== -1 ? initialIndex : 0;

    this._buildElementPool();
    const resizeObserver = new ResizeObserver(() => this._updateLayoutAndPositionElements(true, true));
    resizeObserver.observe(this.container);
  }

  _buildElementPool() {
    this.elementPool = [];
    for (let i = 0; i < this.poolSize; i++) {
      const node = document.createElement('div');
      node.innerHTML = `<button class="node-button"><span></span></button>`;
      this.track.append(node);
      this.elementPool.push(node);
    }
  }

  _applySemanticText() {
    const connectionsNode = this.container.querySelector('.connections-node');
    if (connectionsNode) {
        const textSpan = connectionsNode.querySelector('span');
        if (textSpan) {
            // FIX: Change text to "View Relations" and add a dropdown icon
            textSpan.innerHTML = 'View Relations <span class="material-symbols-rounded" style="font-size: 18px; vertical-align: bottom;">keyboard_arrow_down</span>';
        }
    }
  }

  _updateLayoutAndPositionElements(isInstant = true, applySemanticText = true) {
    if (!this.container.offsetWidth) return;
    
    const viewportWidth = this.viewport.offsetWidth;
    const computedStyle = getComputedStyle(this.container);
    const gap = parseFloat(computedStyle.columnGap) || 0;
    
    this.layout.slotWidth = (viewportWidth - (2 * gap)) / 3;
    this.layout.slideDistance = this.layout.slotWidth + gap;
    this.layout.gap = gap;

    const centerSlot = Math.floor(this.elementPool.length / 2);

    this.elementPool.forEach((node, i) => {
      gsap.set(node, { x: i * this.layout.slideDistance, width: this.layout.slotWidth });
    });
    
    const gap1 = this.track.querySelector('#arrow-gap-1');
    const gap2 = this.track.querySelector('#arrow-gap-2');
    const gap1X = (centerSlot - 1) * this.layout.slideDistance + this.layout.slotWidth;
    const gap2X = centerSlot * this.layout.slideDistance + this.layout.slotWidth;
    gsap.set(gap1, { x: gap1X, width: this.layout.gap });
    gsap.set(gap2, { x: gap2X, width: this.layout.gap });


    const selectedNodeCenterOnTrack = (centerSlot * this.layout.slideDistance) + (this.layout.slotWidth / 2);
    const viewportCenter = viewportWidth / 2;
    gsap.set(this.track, { x: viewportCenter - selectedNodeCenterOnTrack });

    this.elementPool.forEach((node, i) => {
      const dataIndexOffset = i - centerSlot;
      let dataIndex = (this.selectedIndex + dataIndexOffset + this.nodeData.length * 10) % this.nodeData.length;
      this._updateNodeState(node, this.nodeData[dataIndex], dataIndexOffset, isInstant);
    });

    if (applySemanticText) {
        this._applySemanticText();
    }

    this._attachAllListeners();
  }

  _updateNodeState(node, data, dataIndexOffset, isInstant = true) {
    const button = node.querySelector('.node-button');
    const textSpan = node.querySelector('span');
    
    let type = 'offscreen';
    if (dataIndexOffset === -1) type = 'last';
    else if (dataIndexOffset === 0) type = 'selected';
    else if (dataIndexOffset === 1) type = 'connections';
    
    node.className = `node-group ${type}-node`;
    
    let newText = data ? data.name : '';
    if (dataIndexOffset === -1 && this.selectedIndex === 0) {
        node.className = `node-group last-node none-state`;
        newText = 'None';
    }

    if (isInstant) {
      // The Connections button is always blanked initially; its text is set by animations/semantic text.
      textSpan.innerHTML = (type === 'connections') ? '' : newText;
      gsap.set(button, { clearProps: 'all' });
      if (type === 'selected') {
        Object.assign(button.style, { borderColor: this.colors.selectedBorder, backgroundColor: this.colors.selectedBg, color: this.colors.selectedColor, borderWidth: '2px', padding: '6px 11px', transform: 'translateY(0)' });
      } else {
        button.classList.add('btn-secondary');
        if (node.classList.contains('none-state')) button.classList.add('disabled-none');
      }
    }
  }

  navigate(direction) {
    const targetIndex = this.selectedIndex + (direction === 'backward' ? -1 : 1);
    const targetId = this.nodeData[targetIndex]?.id;
    if (targetId) {
      this.navigateToId(targetId);
    }
  }
  
  navigateToId(targetId) {
    if (this.isAnimating || !targetId) return;
    const targetIndex = this.nodeData.findIndex(n => n.id === targetId);
    if (targetIndex === -1 || targetIndex === this.selectedIndex) return;

    this.isAnimating = true;

    const indexDifference = targetIndex - this.selectedIndex;
    const isBackward = indexDifference < 0;
    const animationDistance = this.layout.slideDistance * (isBackward ? 1 : -1);
    const centerSlot = Math.floor(this.poolSize / 2);

    // --- Phase 0: Pre-Animation Setup ---
    this.container.dispatchEvent(new CustomEvent('navigate', { bubbles: true, detail: { id: targetId } }));
    
    const connectionsNode = this.container.querySelector('.connections-node');
    if (connectionsNode) {
      connectionsNode.querySelector('span').innerHTML = '';
    }
    if (!isBackward) {
      const incomingNode = this.elementPool[centerSlot + 2];
      if (incomingNode) {
        incomingNode.querySelector('span').innerHTML = '';
      }
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.selectedIndex = targetIndex;
        // Phase 2 Step 1: Reorder DOM for infinite scroll
        if (isBackward) {
            for (let i = 0; i < Math.abs(indexDifference); i++) { this.track.prepend(this.track.lastElementChild); }
        } else {
            for (let i = 0; i < indexDifference; i++) { this.track.appendChild(this.track.firstElementChild); }
        }
        // Phase 2 Step 2: Reset layout instantly.
        this._updateLayoutAndPositionElements(true, false);

        // Phase 2 Step 3: Instantly update the connections button text.
        // FIX: Remove text cross-fade animation and set innerHTML directly.
        const newConnectionsNode = this.container.querySelector('.connections-node');
        if (newConnectionsNode) {
            const textSpan = newConnectionsNode.querySelector('span');
            if (textSpan) {
                textSpan.innerHTML = 'View Relations <span class="material-symbols-rounded" style="font-size: 18px; vertical-align: bottom;">keyboard_arrow_down</span>';
            }
        }

        this.isAnimating = false;
      }
    });

    // Phase 1: The Slide Animation
    tl.to(this.track, { x: `+=${animationDistance}`, duration: this.duration, ease: this.ease }, 0);

    this.elementPool.forEach((node, i) => {
        const button = node.querySelector('.node-button');
        const currentOffset = i - centerSlot;
        const futureOffset = currentOffset + (isBackward ? 1 : -1);
        
        if (futureOffset === 0) {
             button.classList.remove('btn-secondary');
             tl.to(button, { borderColor: this.colors.selectedBorder, backgroundColor: this.colors.selectedBg, color: this.colors.selectedColor, borderWidth: '2px', padding: '6px 11px', duration: this.duration, ease: this.ease }, 0);
        } else {
             button.classList.add('btn-secondary');
             tl.to(button, { borderColor: this.colors.defaultBorder, backgroundColor: this.colors.defaultBg, color: this.colors.defaultColor, borderWidth: '1px', padding: '7px 12px', duration: this.duration, ease: this.ease }, 0);
        }
    });
  }

  setConnectedNodeActive(isActive) {
    const connectionsNodeButton = this.container.querySelector('.connections-node .node-button');
    if (connectionsNodeButton) {
      connectionsNodeButton.classList.toggle('active', isActive);
    }
  }

  _attachAllListeners() {
    this.elementPool.forEach(node => {
      const button = node.querySelector('.node-button');
      if (button) {
        const newBtn = button.cloneNode(true);
        button.parentNode.replaceChild(newBtn, button);
      }
    });

    const lastNodeGroup = this.container.querySelector('.last-node');
    if (lastNodeGroup) {
        const lastNodeButton = lastNodeGroup.querySelector('.node-button');
        if (lastNodeButton) {
            lastNodeButton.onclick = lastNodeGroup.classList.contains('none-state') ? null : () => this.navigate('backward'); 
        }
    }
    
    const connectionsNodeGroup = this.container.querySelector('.connections-node');
    if(connectionsNodeGroup){
        const connectionsNodeButton = connectionsNodeGroup.querySelector('.node-button');
        if(connectionsNodeButton){
            connectionsNodeButton.onclick = () => this.container.dispatchEvent(new CustomEvent('toggleConnectionsDropdown', { bubbles: true }));
        }
    }
  }
}