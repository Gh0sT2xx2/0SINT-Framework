import * as d3 from 'd3';
import { data } from './data';

export function createOSINTChart(container: HTMLElement) {
  // Set up dimensions
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Create a hierarchy from the data
  const root = d3.hierarchy(data);

  // Set up the tree layout with increased spacing
  const treeLayout = d3.tree()
    .size([height - 100, width - 400])
    .separation((a, b) => (a.parent === b.parent ? 3 : 4));

  // Apply the layout to the hierarchy
  treeLayout(root);

  // Create the SVG container
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto; font: 12px monospace;');

  // Add a gradient definition
  const defs = svg.append('defs');
  
  // Link gradients for different depths
  const gradients = [
    { id: 'linkGradient0', color1: '#00ff00', color2: '#003300' },
    { id: 'linkGradient1', color1: '#00ff00', color2: '#002200' },
    { id: 'linkGradient2', color1: '#00ff00', color2: '#001100' },
    { id: 'linkGradient3', color1: '#00ff00', color2: '#001100' }
  ];

  gradients.forEach(({ id, color1, color2 }) => {
    const gradient = defs.append('linearGradient')
      .attr('id', id)
      .attr('gradientUnits', 'userSpaceOnUse');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color1);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color2);
  });

  // Node gradients for different depths
  const nodeGradients = [
    { id: 'nodeGradient0', color1: '#00ff00', color2: '#003300' },
    { id: 'nodeGradient1', color1: '#00ff00', color2: '#002200' },
    { id: 'nodeGradient2', color1: '#00ff00', color2: '#001100' },
    { id: 'nodeGradient3', color1: '#00ff00', color2: '#001100' }
  ];

  nodeGradients.forEach(({ id, color1, color2 }) => {
    const gradient = defs.append('radialGradient')
      .attr('id', id);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color1);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color2);
  });

  // Add a group element to apply the zoom transformation
  const g = svg.append('g');

  // Define the zoom behavior
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 5])
    .on('zoom', (event) => {
      g.attr('transform', event.transform.toString());
    });

  // Apply the zoom behavior to the SVG
  svg.call(zoom)
    .call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7));

  // Create groups for links and nodes
  const links = g.append('g').attr('class', 'links');
  const nodes = g.append('g').attr('class', 'nodes');

  // Keep track of expanded nodes
  const expandedNodes = new Set();

  // Function to update the visualization
  function update(source: d3.HierarchyNode<unknown>, duration = 750) {
    // Reapply layout to get updated positions
    treeLayout(root);

    // Update links
    const link = links.selectAll('.link')
      .data(root.links(), (d: any) => d.target.id);

    // Enter new links
    const linkEnter = link.enter()
      .append('path')
      .attr('class', 'link')
      .attr('stroke', (d: any) => `url(#linkGradient${d.target.depth % 4})`)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .attr('opacity', 0)
      .attr('d', (d: any) => {
        const o = { x: source.x0 || source.x, y: source.y0 || source.y };
        return diagonal({ source: o, target: o });
      });

    // Update existing links
    link.merge(linkEnter as any)
      .transition()
      .duration(duration)
      .attr('d', diagonal)
      .attr('opacity', 1);

    // Exit links
    link.exit()
      .transition()
      .duration(duration)
      .attr('d', (d: any) => {
        const o = { x: source.x, y: source.y };
        return diagonal({ source: o, target: o });
      })
      .attr('opacity', 0)
      .remove();

    // Update nodes
    const node = nodes.selectAll('.node')
      .data(root.descendants(), (d: any) => d.id);

    // Enter new nodes
    const nodeEnter = node.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', () => `translate(${source.y0 || source.y},${source.x0 || source.x})`)
      .attr('opacity', 0)
      .on('click', (event, d: any) => {
        event.stopPropagation();

        if (d.data.link) {
          window.open(d.data.link, '_blank'); // Open the link in a new tab
          return; // Exit early to avoid expanding/collapsing
        }

        if (d.children) {
          d._children = d.children;
          d.children = null;
          expandedNodes.delete(d.id);
        } else if (d._children) {
          d.children = d._children;
          d._children = null;
          expandedNodes.add(d.id);
        }
        update(d);
      })
      .on('mouseover', (event, d: any) => {
        const tooltip = document.getElementById('node-tooltip');
        if (tooltip) {
          tooltip.style.display = 'block';
          tooltip.style.left = `${event.pageX + 10}px`;
          tooltip.style.top = `${event.pageY + 10}px`;
          tooltip.textContent = d.data.name;
        }

        if (d.data.description) {
          const toolInfo = document.getElementById('tool-info');
          const toolName = document.getElementById('tool-name');
          const toolDescription = document.getElementById('tool-description');
          if (toolInfo && toolName && toolDescription) {
            toolName.textContent = d.data.name;
            toolDescription.textContent = d.data.description;
            toolInfo.style.display = 'block';
          }
        }
      })
      .on('mouseout', () => {
        const tooltip = document.getElementById('node-tooltip');
        const toolInfo = document.getElementById('tool-info');
        if (tooltip) tooltip.style.display = 'none';
        if (toolInfo) toolInfo.style.display = 'none';
      });

    // Add circles to nodes
    nodeEnter.append('circle')
      .attr('r', 0)
      .attr('fill', (d: any) => `url(#nodeGradient${d.depth % 4})`)
      .attr('stroke', '#00ff00')
      .attr('stroke-width', 2)
      .attr('class', 'node-circle');

    // Add labels
    nodeEnter.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: any) => d.children || d._children ? -12 : 12)
      .attr('text-anchor', (d: any) => d.children || d._children ? 'end' : 'start')
      .text((d: any) => d.data.name)
      .attr('fill', '#00ff00')
      .style('font-size', '12px')
      .style('opacity', 0);

    // Update existing nodes
    const nodeUpdate = nodeEnter.merge(node as any)
      .transition()
      .duration(duration)
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
      .attr('opacity', 1);

    nodeUpdate.select('circle')
      .attr('r', 6)
      .attr('class', (d: any) => d._children ? 'node-circle pulse' : 'node-circle');

    nodeUpdate.select('text')
      .style('opacity', 1);

    // Exit nodes
    const nodeExit = node.exit()
      .transition()
      .duration(duration)
      .attr('transform', () => `translate(${source.y},${source.x})`)
      .attr('opacity', 0)
      .remove();

    // Store old positions for transitions
    root.descendants().forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Helper function for drawing diagonal links
  function diagonal(d: any) {
    return `M ${d.source.y} ${d.source.x}
            C ${(d.source.y + d.target.y) / 2} ${d.source.x},
              ${(d.source.y + d.target.y) / 2} ${d.target.x},
              ${d.target.y} ${d.target.x}`;
  }

  // Initialize positions and collapsed state
  root.descendants().forEach((d: any, i) => {
    d.id = i;
    d.x0 = root.x;
    d.y0 = root.y;
    if (d.children) {
      d._children = d.children;
      if (d.depth > 1) {
        d.children = null;
      } else {
        expandedNodes.add(d.id);
      }
    }
  });

  // Initial update
  update(root as any, 0);

  // Add event listeners for expand/collapse buttons
  document.getElementById('expand-all')?.addEventListener('click', () => {
    expandAll(root);
    update(root as any);
  });

  document.getElementById('collapse-all')?.addEventListener('click', () => {
    collapseAll(root);
    update(root as any);
  });

  // Function to expand all nodes
  function expandAll(d: d3.HierarchyNode<unknown>) {
    if ((d as any)._children) {
      (d as any).children = (d as any)._children;
      (d as any)._children = null;
      expandedNodes.add((d as any).id);
    }
    if ((d as any).children) {
      (d as any).children.forEach(expandAll);
    }
  }

  // Function to collapse all nodes
  function collapseAll(d: d3.HierarchyNode<unknown>) {
    if ((d as any).children) {
      (d as any)._children = (d as any).children;
      (d as any).children = null;
      expandedNodes.delete((d as any).id);
    }
    if ((d as any)._children) {
      (d as any)._children.forEach(collapseAll);
    }
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    svg.attr('width', window.innerWidth)
       .attr('height', window.innerHeight);
  });
}