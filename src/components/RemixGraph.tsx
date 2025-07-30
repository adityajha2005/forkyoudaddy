import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getAllIPs } from '../services/ipService';

interface IPNode {
  id: string;
  title: string;
  author: string;
  license: string;
  type: string;
  remixCount: number;
  createdAt: string;
  parentId?: string;
}

interface GraphLink {
  source: string;
  target: string;
}

const RemixGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<IPNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<IPNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const simulationRef = useRef<any>(null);

  // Load IP data and build graph
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setIsLoading(true);
        const ips = await getAllIPs();
        
        // Build graph structure
        const graphNodes: IPNode[] = ips.map(ip => ({
          id: ip.id,
          title: ip.title,
          author: ip.author,
          license: ip.license,
          type: ip.contentType === 'text' ? 'TEXT' : 'IMAGE',
          remixCount: ip.remixCount,
          createdAt: ip.createdAt,
          parentId: ip.parentId
        }));

        // Create links based on parent-child relationships
        const graphLinks: GraphLink[] = [];
        graphNodes.forEach(node => {
          if (node.parentId) {
            const parent = graphNodes.find(n => n.id === node.parentId);
            if (parent) {
              graphLinks.push({
                source: parent.id,
                target: node.id
              });
            }
          }
        });

        setNodes(graphNodes);
        setLinks(graphLinks);
      } catch (error) {
        console.error('Error loading graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGraphData();
  }, []);

  // Forking animation function
  const animateForking = (parentNode: IPNode, childNode: IPNode) => {
    if (!svgRef.current || isAnimating) return;
    
    setIsAnimating(true);
    const svg = d3.select(svgRef.current);
    
    // Get parent and child node positions from simulation
    const parentData = simulationRef.current?.nodes().find((n: any) => n.id === parentNode.id);
    const childData = simulationRef.current?.nodes().find((n: any) => n.id === childNode.id);
    
    if (!parentData || !childData) {
      setIsAnimating(false);
      return;
    }
    
    // Add a "sparkle" effect at the child node
    const sparkle = svg.append('circle')
      .attr('cx', childData.x)
      .attr('cy', childData.y)
      .attr('r', 0)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 4)
      .style('opacity', 1);
    
    sparkle.transition()
      .duration(1200)
      .ease(d3.easeCubic)
      .attr('r', 60)
      .style('opacity', 0)
      .remove();
    
    // End animation after sparkle effect
    setTimeout(() => {
      setIsAnimating(false);
    }, 1200);
  };

  // Function to trigger forking animation (can be called from parent)
  const triggerForkAnimation = (parentId: string, childId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    const childNode = nodes.find(n => n.id === childId);
    
    if (parentNode && childNode) {
      animateForking(parentNode, childNode);
    }
  };

  // Expose the trigger function globally for external calls
  React.useEffect(() => {
    (window as any).triggerForkAnimation = triggerForkAnimation;
  }, [nodes]);

  // Render D3 force-directed graph
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || isLoading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous graph

    const width = 1200;
    const height = 800;

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: any) => {
        setZoomLevel(event.transform.k);
        svg.select('.graph-container').attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Create main container
    const container = svg.append('g')
      .attr('class', 'graph-container');

    // Create simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120).strength(0.8))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(100))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));
    
    // Store simulation reference for animations
    simulationRef.current = simulation;

    // Create gradient definitions
    const defs = svg.append('defs');
    
    // Text IP gradient
    defs.append('radialGradient')
      .attr('id', 'textGradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#10b981' },
        { offset: '70%', color: '#059669' },
        { offset: '100%', color: '#047857' }
      ])
      .enter()
      .append('stop')
      .attr('offset', (d: any) => d.offset)
      .attr('stop-color', (d: any) => d.color);

    // Image IP gradient
    defs.append('radialGradient')
      .attr('id', 'imageGradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#3b82f6' },
        { offset: '70%', color: '#2563eb' },
        { offset: '100%', color: '#1d4ed8' }
      ])
      .enter()
      .append('stop')
      .attr('offset', (d: any) => d.offset)
      .attr('stop-color', (d: any) => d.color);

    // Knowledge IP gradient
    defs.append('radialGradient')
      .attr('id', 'knowledgeGradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#8b5cf6' },
        { offset: '70%', color: '#7c3aed' },
        { offset: '100%', color: '#6d28d9' }
      ])
      .enter()
      .append('stop')
      .attr('offset', (d: any) => d.offset)
      .attr('stop-color', (d: any) => d.color);

    // Create arrow marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 50)
      .attr('refY', 0)
      .attr('markerWidth', 16)
      .attr('markerHeight', 16)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-8L16,0L0,8')
      .attr('fill', '#10b981')
      .attr('stroke', '#000')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))');

    // Add glow filter for links
    defs.append('filter')
      .attr('id', 'glow')
      .append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    
    const feMerge = defs.select('#glow').append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create links with curved paths for better visibility
    const link = container.append('g')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 6)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrowhead)')
      .style('opacity', 0.9)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3)) url(#glow)')
      .style('stroke-linecap', 'round')
      .on('mouseover', function() {
        d3.select(this)
          .style('opacity', 1)
          .attr('stroke-width', 10)
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))');
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('opacity', 0.9)
          .attr('stroke-width', 6)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
      });

    // Create nodes
    const node = container.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call((selection: any) => {
        selection.call(d3.drag()
          .on('start', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event: any, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }));
      });

    // Add different shapes based on content type
    node.each(function(d: any) {
      const nodeGroup = d3.select(this);
      const size = Math.max(40, Math.min(80, 40 + d.remixCount * 5));
      
      if (d.type === 'TEXT') {
        // Rectangle for text IPs
        nodeGroup.append('rect')
          .attr('width', size * 2)
          .attr('height', size * 1.5)
          .attr('x', -size)
          .attr('y', -size * 0.75)
          .attr('rx', 8)
          .attr('ry', 8)
          .attr('fill', 'url(#textGradient)')
          .attr('stroke', '#000')
          .attr('stroke-width', 3)
          .style('cursor', 'pointer')
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))')
          .on('click', (event: any, d: any) => {
            setSelectedNode(d);
          })
          .on('mouseover', function(this: any, event: any, d: any) {
            d3.select(this)
              .attr('stroke-width', 5)
              .style('filter', 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))');
            
            // Highlight connected links
            link.style('opacity', (l: any) => 
              l.source.id === d.id || l.target.id === d.id ? 1 : 0.2
            );
          })
          .on('mouseout', function(this: any, event: any, d: any) {
            d3.select(this)
              .attr('stroke-width', 3)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))');
            
            // Reset link opacity
            link.style('opacity', 0.6);
          });
      } else if (d.type === 'IMAGE') {
        // Triangle for image IPs
        const trianglePoints = [
          [0, -size],           // top
          [-size * 0.866, size * 0.5],  // bottom left
          [size * 0.866, size * 0.5]    // bottom right
        ].join(' ');
        
        nodeGroup.append('polygon')
          .attr('points', trianglePoints)
          .attr('fill', 'url(#imageGradient)')
          .attr('stroke', '#000')
          .attr('stroke-width', 3)
          .style('cursor', 'pointer')
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))')
          .on('click', (event: any, d: any) => {
            setSelectedNode(d);
          })
          .on('mouseover', function(this: any, event: any, d: any) {
            d3.select(this)
              .attr('stroke-width', 5)
              .style('filter', 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))');
            
            // Highlight connected links
            link.style('opacity', (l: any) => 
              l.source.id === d.id || l.target.id === d.id ? 1 : 0.2
            );
          })
          .on('mouseout', function(this: any, event: any, d: any) {
            d3.select(this)
              .attr('stroke-width', 3)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))');
            
            // Reset link opacity
            link.style('opacity', 0.6);
          });
      } else if (d.type === 'KNOWLEDGE') {
        // Diamond for knowledge IPs
        const diamondPoints = [
          [0, -size],           // top
          [size, 0],            // right
          [0, size],            // bottom
          [-size, 0]            // left
        ].join(' ');
        
        nodeGroup.append('polygon')
          .attr('points', diamondPoints)
          .attr('fill', 'url(#knowledgeGradient)')
          .attr('stroke', '#000')
          .attr('stroke-width', 3)
          .style('cursor', 'pointer')
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))')
          .on('click', (event: any, d: any) => {
            setSelectedNode(d);
          })
          .on('mouseover', function(this: any, event: any, d: any) {
            d3.select(this)
              .attr('stroke-width', 5)
              .style('filter', 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))');
            
            // Highlight connected links
            link.style('opacity', (l: any) => 
              l.source.id === d.id || l.target.id === d.id ? 1 : 0.2
            );
          })
          .on('mouseout', function(this: any, event: any, d: any) {
            d3.select(this)
              .attr('stroke-width', 3)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))');
            
            // Reset link opacity
            link.style('opacity', 0.6);
          });
      } else {
        // Circle for other types
        nodeGroup.append('circle')
          .attr('r', size)
          .attr('fill', 'url(#textGradient)')
          .attr('stroke', '#000')
          .attr('stroke-width', 3)
          .style('cursor', 'pointer')
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))')
          .on('click', (event: any, d: any) => {
            setSelectedNode(d);
          })
          .on('mouseover', function(this: any, event: any, d: any) {
            d3.select(this)
              .attr('stroke-width', 5)
              .style('filter', 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))');
            
            // Highlight connected links
            link.style('opacity', (l: any) => 
              l.source.id === d.id || l.target.id === d.id ? 1 : 0.2
            );
          })
          .on('mouseout', function(this: any, event: any, d: any) {
            d3.select(this)
              .attr('stroke-width', 3)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))');
            
            // Reset link opacity
            link.style('opacity', 0.6);
          });
      }
    });

    // Add node labels
    node.append('text')
      .text((d: any) => d.title.length > 15 ? d.title.substring(0, 15) + '...' : d.title)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#000')
      .style('pointer-events', 'none');

    // Add remix count badges
    node.append('text')
      .text((d: any) => d.remixCount > 0 ? `🍴${d.remixCount}` : '')
      .attr('text-anchor', 'middle')
      .attr('dy', '2.2em')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#000')
      .style('pointer-events', 'none');

    // Add author labels
    node.append('text')
      .text((d: any) => `${d.author.substring(0, 8)}...`)
      .attr('text-anchor', 'middle')
      .attr('dy', '3.2em')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      // Update link positions with curved paths
      link.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        
        // Create a curved path with control points
        const midX = (d.source.x + d.target.x) / 2;
        const midY = (d.source.y + d.target.y) / 2;
        const offset = Math.min(dr * 0.2, 30); // Reduced curvature for closer nodes
        
        return `M${d.source.x},${d.source.y} Q${midX + offset},${midY + offset} ${d.target.x},${d.target.y}`;
      });

      // Update node positions
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, links, isLoading]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-meme-white border-2 border-black rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pepe-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading remix graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="bg-meme-white border-2 border-black rounded-lg p-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
            LIVE REMIX <span className="text-pepe-green">GRAPH</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Interactive force-directed graph showing how ideas evolve, fork, and spread across the creative network.
          </p>
        </div>

        {/* Graph Stats */}
        <div className="flex justify-center items-center space-x-8 mb-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-md"></div>
            <span>Text IPs (Rectangle)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
            <span>Image IPs (Triangle)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-600" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
            <span>Knowledge IPs (Diamond)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍴</span>
            <span>Remix Count</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔍</span>
            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>

        {/* Graph Container */}
        <div className="flex justify-center">
          <div className="border-2 border-black rounded-lg overflow-hidden bg-gray-50">
            <svg
              ref={svgRef}
              width={1200}
              height={800}
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>💡 <strong>Interactive Features:</strong> Drag nodes to move them • Scroll to zoom • Click nodes for details • Hover to highlight connections</p>
          <p className="mt-2 text-xs text-gray-500">
            🔗 <strong>Connections:</strong> Green curved lines show remix relationships • Arrows point from original to remix • Hover over lines to highlight • Nodes are now larger for better visibility
          </p>
        </div>

        {/* Node Details Panel */}
        {selectedNode && (
          <div className="mt-8 p-6 bg-gray-50 border-2 border-black rounded-lg">
            <h3 className="text-xl font-bold text-black mb-4">Selected IP Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Title:</strong> {selectedNode.title}</p>
                <p><strong>Author:</strong> {selectedNode.author}</p>
                <p><strong>Type:</strong> {selectedNode.type}</p>
              </div>
              <div>
                <p><strong>License:</strong> {selectedNode.license}</p>
                <p><strong>Remix Count:</strong> {selectedNode.remixCount}</p>
                <p><strong>Created:</strong> {new Date(selectedNode.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-4 bg-pepe-green hover:bg-green-600 text-black font-bold px-4 py-2 rounded border-2 border-black transition-colors"
            >
              Close Details
            </button>
          </div>
        )}

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-600 text-lg font-bold mb-2">
              No IPs to display yet
            </p>
            <p className="text-gray-400 text-sm">
              Create some IPs and remixes to see the graph in action!
            </p>
          </div>
        )}

        {/* Graph Controls */}
        <div className="mt-8 text-center space-x-4">
          <button
            onClick={() => {
              if (nodes.length >= 2) {
                const parent = nodes[0];
                const child = nodes.find(n => n.parentId === parent.id);
                if (child) {
                  animateForking(parent, child);
                }
              }
            }}
            disabled={isAnimating || nodes.length < 2}
            className="bg-pepe-green hover:bg-green-600 disabled:bg-gray-400 text-black font-bold px-4 py-2 rounded border-2 border-black transition-colors"
          >
            {isAnimating ? '🎬 Animating...' : '🎬 Test Fork Animation'}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-pepe-green hover:bg-green-600 text-black font-bold px-6 py-3 rounded-lg border-2 border-black transition-colors mr-4"
          >
            🔄 Refresh Graph
          </button>
          <button
            onClick={() => setSelectedNode(null)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg border-2 border-black transition-colors mr-4"
          >
            Clear Selection
          </button>
          <button
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().duration(750).call(
                d3.zoom().transform as any,
                d3.zoomIdentity
              );
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg border-2 border-black transition-colors"
          >
            🎯 Reset View
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemixGraph;