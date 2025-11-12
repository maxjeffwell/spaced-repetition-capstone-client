import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import styles from './neural-network-visualizer.module.css';

const NeuralNetworkVisualizer = ({ activations, featureNames }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!activations || !featureNames) {
            return;
        }

        const renderVisualization = async () => {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove(); // Clear previous render

            const width = svg.attr('width');
            const height = svg.attr('height');
            const margin = { top: 50, right: 150, bottom: 50, left: 150 };

            const layerSizes = activations.map(layer => layer.shape[1]);
            const numLayers = layerSizes.length;

            const layerSeparation = (width - margin.left - margin.right) / (numLayers - 1);

            const nodes = [];
            const links = [];

            // Read all activation data asynchronously (WebGPU-friendly)
            for (let i = 0; i < numLayers; i++) {
                const numNodes = layerSizes[i];
                const x = margin.left + i * layerSeparation;

                // Use async .array() instead of sync .arraySync()
                const layerData = await activations[i].array();

                const layerNodes = d3.range(numNodes).map(j => {
                    const y = margin.top + (height - margin.top - margin.bottom) * (j + 0.5) / numNodes;
                    const activation = layerData[0][j];
                    let name = '';
                    if (i === 0) {
                        name = featureNames[j];
                    }
                    return { id: `node-${i}-${j}`, x, y, layer: i, index: j, activation, name };
                });
                nodes.push(...layerNodes);
            }

            for (let i = 0; i < numLayers - 1; i++) {
                const sourceLayerNodes = nodes.filter(d => d.layer === i);
                const targetLayerNodes = nodes.filter(d => d.layer === i + 1);
                for (const sourceNode of sourceLayerNodes) {
                    for (const targetNode of targetLayerNodes) {
                        links.push({ source: sourceNode.id, target: targetNode.id });
                    }
                }
            }

            const nodeById = new Map(nodes.map(d => [d.id, d]));

            const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([-1, 1]);

            svg.append('g')
                .selectAll('line')
                .data(links)
                .enter()
                .append('line')
                .attr('class', styles.link)
                .attr('x1', d => nodeById.get(d.source).x)
                .attr('y1', d => nodeById.get(d.source).y)
                .attr('x2', d => nodeById.get(d.target).x)
                .attr('y2', d => nodeById.get(d.target).y);

            const nodeGroups = svg.append('g')
                .selectAll('g')
                .data(nodes)
                .enter()
                .append('g')
                .attr('transform', d => `translate(${d.x},${d.y})`);

            nodeGroups.append('circle')
                .attr('r', 10)
                .attr('fill', d => colorScale(d.activation));

            nodeGroups.append('text')
                .attr('class', styles.nodeLabel)
                .attr('x', d => d.layer === 0 ? -15 : 15)
                .attr('y', 3)
                .attr('text-anchor', d => d.layer === 0 ? 'end' : 'start')
                .text(d => d.name);
        };

        renderVisualization();

    }, [activations, featureNames]);

    return (
        <div className={styles.container}>
            <svg ref={svgRef} width="1200" height="600"></svg>
        </div>
    );
};

export default NeuralNetworkVisualizer;
