// src/navigator.js
import { gsap } from 'gsap';

export class NodeNavigator {
  constructor(mountElement) {
    this.container = mountElement;
    this.viewport = this.container.querySelector('#nodes-viewport');
    this.track = this.container.querySelector('#nodes-track');
    this.arrowGap1 = this.track.querySelector('#arrow-gap-1');
    this.arrowGap2 = this.track.querySelector('#arrow-gap-2');
    
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
        defaultColor: getComputedStyle(document.documentElement).getPropertyValue('--control-fg-primary').trim(), // Use primary foreground for default
    };
  }

  init(initialNodeId, nodeData) {
    this.nodeData = nodeData;
    const initialIndex = this.nodeData.findIndex(n => n.id === initialNodeId);
    this.selectedIndex = initialIndex !== -1 ? initialIndex : 0;

    this._buildElementPool();
    const resizeObserver = new ResizeObserver(() => this._updateLayoutAndPositionElements());
    resizeObserver.observe(this.container);
  }

  _buildElementPool() {
    this.elementPool = [];
    for (let i = 0; i < this.poolSize; i++) {
      const node = document.createElement('div');
      node.innerHTML = `<button class="node-button"></button>`;
      this.track.insertBefore(node, this.arrowGap1);
      this.elementPool.push(node);
    }
  }

  _updateLayoutAndPositionElements(isInstant = true) {
    if (!this.container.offsetWidth) return;
    
    const viewportWidth = this.viewport.offsetWidth;
    const computedStyle = getComputedStyle(this.container);
    const gap = parseFloat(computedStyle.columnGap) || 0;
    
    this.layout.slotWidth = (viewportWidth - (2 * gap)) / 3;
    this.layout.slideDistance = this.layout.slotWidth + gap;

    const centerSlot = Math.floor(this.elementPool.length / 2);

    this.elementPool.forEach((node, i) => {
      gsap.set(node, { x: i * this.layout.slideDistance, width: this.layout.slotWidth });
    });

    const selectedNodeCenterOnTrack = (centerSlot * this.layout.slideDistance) + (this.layout.slotWidth / 2);
    const viewportCenter = viewportWidth / 2;
    gsap.set(this.track, { x: viewportCenter - selectedNodeCenterOnTrack });

    this.elementPool.forEach((node, i) => {
      const dataIndexOffset = i - centerSlot;
      const dataIndex = (this.selectedIndex + dataIndexOffset + this.nodeData.length * 100) % this.nodeData.length;
      this._updateNodeState(node, this.nodeData[dataIndex], dataIndexOffset, isInstant);
    });

    const arrowPadding = 12;
    const arrowWidth = gap - (arrowPadding * 2);
    const lastNodeXOnTrack = (centerSlot - 1) * this.layout.slideDistance;
    const firstGapStartX = lastNodeXOnTrack + this.layout.slotWidth + arrowPadding;
    const secondGapStartX = firstGapStartX + this.layout.slotWidth + (arrowPadding * 2);
    gsap.set(this.arrowGap1, { left: firstGapStartX, width: arrowWidth });
    gsap.set(this.arrowGap2, { left: secondGapStartX, width: arrowWidth });
    
    gsap.set([this.arrowGap1.querySelector('.left'), this.arrowGap2.querySelector('.left')], { opacity: 0 });
    gsap.set([this.arrowGap1.querySelector('.right'), this.arrowGap2.querySelector('.right')], { opacity: 1 });

    this._attachAllListeners();
  }

  _updateNodeState(node, data, dataIndexOffset, isInstant = true) {
    let type = 'offscreen';
    if (dataIndexOffset === -1) type = 'last';
    else if (dataIndexOffset === 0) type = 'selected';
    else if (dataIndexOffset === 1) type = 'connected';
    
    const button = node.querySelector('.node-button');
    node.className = `node-group ${type}-node`;
    
    button.innerHTML = `<span>${data.name}</span>`;
    if (type === 'connected') {
        button.innerHTML = `<span>${data.connections} connections</span>`;
    }

    // Crucially, remove all custom inline styles when not selected
    // to allow CSS classes to take full control.
    if (type === 'selected') {
        button.classList.remove('btn-secondary'); // Ensure it doesn't get secondary button styles
        if (isInstant) {
            gsap.set(button, {
                borderColor: this.colors.selectedBorder,
                backgroundColor: this.colors.selectedBg,
                color: this.colors.selectedColor,
                borderWidth: '2px',
                padding: '0 11px', // 12px - 1px for each border
                transform: 'translateY(0)',
            });
        }
    } else {
        button.classList.add('btn-secondary'); // Apply secondary button styles via class
        gsap.set(button, { clearProps: 'all' }); // Remove any inline styles from GSAP
    }
  }

  // Public method for dropdown to call
  navigate(direction) {
    this._slide(direction);
  }
  
  // Public method for breadcrumbs to call
  navigateToId(targetId) {
    if (this.isAnimating) return;
    const targetIndex = this.nodeData.findIndex(n => n.id === targetId);
    if (targetIndex !== -1 && targetIndex !== this.selectedIndex) {
      this.selectedIndex = targetIndex;
      this._updateLayoutAndPositionElements(true); 
      this.container.dispatchEvent(new CustomEvent('navigate', { bubbles: true, detail: { id: this.nodeData[this.selectedIndex].id } }));
    }
  }

  // Public method to set the active state of the connected node button
  setConnectedNodeActive(isActive) {
    const connectedNodeButton = this.container.querySelector('.connected-node .node-button');
    if (connectedNodeButton) {
      connectedNodeButton.classList.toggle('active', isActive);
      // Manually trigger a re-render of the node state to update styles immediately
      // This is a workaround for vanilla JS animation not reacting to class changes
      this._updateNodeState(connectedNodeButton.closest('.node-group'), this.nodeData[(this.selectedIndex + 1 + this.nodeData.length * 100) % this.nodeData.length], 1, true);
    }
  }

  _slide(direction) {
    if (this.isAnimating || !this.layout.slideDistance) return;
    this.isAnimating = true;
    
    const isBackward = direction === 'backward';
    const directionMultiplier = isBackward ? 1 : -1;
    const centerSlot = Math.floor(this.elementPool.length / 2);

    const oldSelectedNodeButton = this.elementPool[centerSlot].querySelector('.node-button');
    const newSelectedNodeButton = isBackward 
      ? this.elementPool[centerSlot - 1].querySelector('.node-button') 
      : this.elementPool[centerSlot + 1].querySelector('.node-button');
    
    const tl = gsap.timeline({
      onComplete: () => {
        const newSelectedIndex = (this.selectedIndex - directionMultiplier + this.nodeData.length) % this.nodeData.length;
        this.selectedIndex = newSelectedIndex;
        
        if (isBackward) { this.track.prepend(this.track.lastElementChild); } 
        else { this.track.appendChild(this.track.firstElementChild); }
        
        this._updateLayoutAndPositionElements(true); // Re-render instantly after move
        this.isAnimating = false;
        
        this.container.dispatchEvent(new CustomEvent('navigate', { bubbles: true, detail: { id: this.nodeData[this.selectedIndex].id } }));
      }
    });

    tl.to(this.track, { x: `+=${this.layout.slideDistance * directionMultiplier}`, duration: this.duration, ease: this.ease }, 0);
    
    // Animate the new selected node to its selected state
    tl.to(newSelectedNodeButton, { 
      borderColor: this.colors.selectedBorder, 
      backgroundColor: this.colors.selectedBg, 
      color: this.colors.selectedColor, 
      borderWidth: '2px', 
      padding: '0 11px', 
      duration: this.duration * 0.8, 
      ease: this.ease,
      overwrite: 'auto',
      onStart: () => {
          newSelectedNodeButton.classList.remove('btn-secondary');
          gsap.set(newSelectedNodeButton, { clearProps: 'all' }); // Clear any lingering btn-secondary styles
      }
    }, 0);
    
    // Animate the old selected node back to its default secondary button state
    tl.fromTo(oldSelectedNodeButton, 
      { 
        borderColor: this.colors.selectedBorder, 
        backgroundColor: this.colors.selectedBg, 
        color: this.colors.selectedColor, 
        borderWidth: '2px', 
        padding: '0 11px' 
      }, 
      { 
        borderColor: this.colors.defaultBorder, 
        backgroundColor: this.colors.defaultBg, 
        color: this.colors.defaultColor, 
        borderWidth: '1px', 
        padding: '0 12px', // 12px for 1px border
        duration: this.duration * 0.8, 
        ease: this.ease,
        overwrite: 'auto',
        onComplete: () => {
            oldSelectedNodeButton.classList.add('btn-secondary');
            gsap.set(oldSelectedNodeButton, { clearProps: 'all' }); // Clear inline styles to let CSS take over
        }
      }, 0);

    const arrowsToFadeIn = isBackward ? '.left' : '.right';
    const arrowsToFadeOut = isBackward ? '.right' : '.left';
    tl.to([this.arrowGap1.querySelector(arrowsToFadeIn), this.arrowGap2.querySelector(arrowsToFadeIn)], { opacity: 1, duration: this.duration * 0.5, ease: 'linear' }, 0);
    tl.to([this.arrowGap1.querySelector(arrowsToFadeOut), this.arrowGap2.querySelector(arrowsToFadeOut)], { opacity: 0, duration: this.duration * 0.5, ease: 'linear' }, 0);
  }

  _attachAllListeners() {
    // Re-attach listeners to new DOM elements if they were swapped
    this.container.querySelectorAll('.node-button').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });

    const lastNodeButton = this.container.querySelector('.last-node .node-button');
    if (lastNodeButton) { lastNodeButton.onclick = () => this._slide('backward'); }
    
    const connectedNodeButton = this.container.querySelector('.connected-node .node-button');
    if (connectedNodeButton) { 
        connectedNodeButton.onclick = () => {
            this.container.dispatchEvent(new CustomEvent('toggleConnectionsDropdown', { bubbles: true }));
        };
    }
  }
}