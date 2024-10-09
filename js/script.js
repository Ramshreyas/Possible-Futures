// Variables and DOM elements
const nodeLabelInput = document.getElementById('node-label');
const nodeShapeSelect = document.getElementById('node-shape');
const nodeAnnotationInput = document.getElementById('node-annotation');
const textArea = document.getElementById('text-area');
const addNodeBtn = document.getElementById('add-node-btn');
const deleteElementBtn = document.getElementById('delete-element-btn');
const addEdgeBtn = document.getElementById('add-edge-btn');
const previewBtn = document.getElementById('preview-btn');

const graphContainer = document.getElementById('graph-container');
const legend = document.getElementById('legend');
const addGraphBtn = document.createElement('div');

addGraphBtn.className = 'add-graph-btn';
addGraphBtn.innerHTML = '<i class="fas fa-plus-circle"></i>&nbsp;Add Graph';

// Sequencing Interface DOM Elements
const sequenceList = document.getElementById('sequence-list');
const addToSequenceBtn = document.getElementById('add-to-sequence-btn');

// Variables
let cy; // Cytoscape instance
let selectedNode = null;
let edgeCreationMode = false; // Variable to track edge creation mode

// Variables to store graphs and the current graph index
let graphs = [];
let currentGraphIndex = 0;

// Sequence data
let sequence = []; // Array to store sequence items as { nodeId, annotation }

// Function to update properties panel
function updatePropertiesPanel(node) {
  if (node) {
    nodeLabelInput.value = node.data('label') || '';
    nodeShapeSelect.value = node.data('nodeShape') || 'ellipse';
    nodeAnnotationInput.value = node.data('annotation') || '';
    nodeLabelInput.disabled = false;
    nodeShapeSelect.disabled = false;
    nodeAnnotationInput.disabled = false;
    textArea.textContent = node.data('annotation') || '';

    // Enable 'Add to Sequence' button
    addToSequenceBtn.disabled = false;
  } else {
    nodeLabelInput.value = '';
    nodeShapeSelect.value = 'ellipse';
    nodeAnnotationInput.value = '';
    nodeLabelInput.disabled = true;
    nodeShapeSelect.disabled = true;
    nodeAnnotationInput.disabled = true;
    textArea.textContent = '';

    // Disable 'Add to Sequence' button
    addToSequenceBtn.disabled = true;
  }
}

// Event listeners for property inputs
nodeLabelInput.addEventListener('input', function() {
  if (selectedNode) {
    selectedNode.data('label', nodeLabelInput.value);
  }
});

nodeShapeSelect.addEventListener('change', function() {
  if (selectedNode) {
    selectedNode.data('nodeShape', nodeShapeSelect.value);
    selectedNode.style('shape', nodeShapeSelect.value);
  }
});

nodeAnnotationInput.addEventListener('input', function() {
  if (selectedNode) {
    selectedNode.data('annotation', nodeAnnotationInput.value);
    textArea.textContent = nodeAnnotationInput.value;

    // Update the annotation in the sequence if the node is in it
    sequence.forEach(seqItem => {
      if (seqItem.nodeId === selectedNode.id()) {
        seqItem.annotation = nodeAnnotationInput.value;
      }
    });
  }
});

// "Add Node" button functionality
addNodeBtn.addEventListener('click', function() {
  if (!selectedNode) {
    alert('Please select a node to add a new node relative to it.');
    return;
  }

  // Generate a unique ID for the new node
  const newNodeId = 'node' + (cy.nodes().length + 1);

  // Calculate position for the new node
  const selectedNodePosition = selectedNode.position();
  const newNodePosition = {
    x: selectedNodePosition.x + 100,
    y: selectedNodePosition.y
  };

  // Add the new node with default properties
  const newNode = cy.add({
    group: 'nodes',
    data: {
      id: newNodeId,
      label: 'New Node',
      nodeShape: 'ellipse',
      annotation: 'New node annotation'
    },
    position: newNodePosition
  });

  // Add an edge between the selected node and the new node
  const newEdgeId = 'edge' + (cy.edges().length + 1);
  cy.add({
    group: 'edges',
    data: {
      id: newEdgeId,
      source: selectedNode.id(),
      target: newNodeId
    }
  });

  // Enable dragging for the new node
  newNode.grabify();

  // Deselect all nodes and select the new node
  cy.nodes().unselect();
  newNode.select();

  // Pan to the new node
  cy.animate({
    center: { eles: newNode },
    duration: 500
  });
});

// "Delete Selected" button functionality
deleteElementBtn.addEventListener('click', function() {
  if (selectedNode) {
    cy.remove(selectedNode);
    selectedNode = null;
    updatePropertiesPanel(null);

    // Update the sequence in case the node was part of it
    sequence = sequence.filter(nodeId => cy.getElementById(nodeId).length > 0);
    updateSequenceList();
  } else {
    alert('Please select a node to delete.');
  }
});

// "Add Edge" button functionality
addEdgeBtn.addEventListener('click', function() {
  if (!selectedNode) {
    alert('Please select a node to start creating an edge from.');
    return;
  }

  edgeCreationMode = true;
  // Provide visual feedback to the user
  graphContainer.style.cursor = 'crosshair';
  alert('Edge creation mode: Click on another node to create an edge.');

  // Optionally, you can highlight the selected node
  selectedNode.addClass('edge-source');
});

previewBtn.addEventListener('click', function() {
  // Save all graphs data
  saveAllGraphs();

  // Prepare the data to send to the viewer
  const transformedGraphs = graphs.map((graph, index) => {
    // Ensure that nodes and edges arrays exist
    const nodesArray = graph.elements.nodes || [];
    const edgesArray = graph.elements.edges || [];

    const graphId = graph.id || `graph${index}`;

    // Transform nodes
    const nodes = nodesArray.map(node => {
      const newNode = {
        data: { ...node.data },
        position: node.position
      };
      // Prefix node ID
      newNode.data.id = `${graphId}_${node.data.id}`;
      // Adjust edges that connect to this node
      // (Handled in edge transformation)
      return newNode;
    });

    // Transform edges
    const edges = edgesArray.map(edge => {
      const newEdge = {
        data: { ...edge.data }
      };
      // Prefix edge ID
      newEdge.data.id = `${graphId}_${edge.data.id}`;
      // Update source and target IDs to match prefixed node IDs
      newEdge.data.source = `${graphId}_${edge.data.source}`;
      newEdge.data.target = `${graphId}_${edge.data.target}`;
      return newEdge;
    });

    // Transform sequence
    const sequence = graph.sequence ? graph.sequence.map(seqItem => ({
      nodeId: `${graphId}_${seqItem.nodeId}`,
      annotation: seqItem.annotation
    })) : [];

    return {
      id: graphId,
      name: graph.name,
      nodes: nodes,
      edges: edges,
      sequence: sequence
    };
  });

  // Use localStorage to pass data to the viewer
  localStorage.setItem('graphData', JSON.stringify(transformedGraphs));

  // Open viewer.html in a new tab
  window.open('viewer.html', '_blank');
});

// Function to save the current graph's elements
function saveCurrentGraph() {
  if (cy) {
    graphs[currentGraphIndex].elements = cy.json().elements;
    graphs[currentGraphIndex].sequence = sequence.slice(); // Use slice() to copy the sequence array
  }
}

// Function to create a new graph
function createNewGraph(name = 'Untitled Graph') {
  const graphData = {
    name: name,
    elements: [], // Empty graph
    sequence: [] // For sequencing interface
  };

  // Add a default node to every new graph
  graphData.elements.push({
    group: 'nodes',
    data: {
      id: 'node1',
      label: 'Node Label',
      nodeShape: 'ellipse',
      annotation: 'Node Annotation'
    },
    position: { x: 100, y: 250 } // Position it on the left
  });

  graphs.push(graphData);
  return graphs.length - 1; // Return the index of the new graph
}

function saveAllGraphs() {
  const originalGraphIndex = currentGraphIndex;

  // Loop over all graphs
  for (let i = 0; i < graphs.length; i++) {
    // Switch to the graph
    switchGraph(i);

    // Save the graph
    saveCurrentGraph();
  }

  // After saving all graphs, reload the original graph
  switchGraph(originalGraphIndex);
}

// Function to render the legend
function renderLegend() {
  legend.innerHTML = ''; // Clear existing legend
  graphs.forEach((graph, index) => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item' + (index === currentGraphIndex ? ' active' : '');
    legendItem.dataset.index = index;

    // Create a container for the input and icon
    const legendContent = document.createElement('div');
    legendContent.className = 'legend-content';

    // Create the input field for the graph name
    const input = document.createElement('input');
    input.type = 'text';
    input.value = graph.name;

    // Add event listener to the input field to update the graph name
    input.addEventListener('input', function(event) {
      graph.name = input.value;
    });

    // Prevent click events on the input from propagating
    input.addEventListener('click', function(event) {
      event.stopPropagation();
    });

    // Create the eye icon for switching graphs
    const eyeIcon = document.createElement('i');
    eyeIcon.className = 'fas fa-eye legend-eye-icon';
    eyeIcon.title = 'Switch to this graph';

    // Add click event listener to the eye icon
    eyeIcon.addEventListener('click', function() {
      switchGraph(index);
    });

    // Append the input and eye icon to the legend content container
    legendContent.appendChild(input);
    legendContent.appendChild(eyeIcon);

    // Append the legend content to the legend item
    legendItem.appendChild(legendContent);

    // Append the legend item to the legend
    legend.appendChild(legendItem);
  });
  legend.appendChild(addGraphBtn);
}

// Function to switch between graphs
function switchGraph(index) {
  if (index < 0 || index >= graphs.length) return;
  saveCurrentGraph(); // Save current graph's elements before switching
  currentGraphIndex = index;
  loadGraph(graphs[currentGraphIndex]);
  renderLegend();
}

// Function to load a graph into Cytoscape
function loadGraph(graphData) {
  // Destroy existing Cytoscape instance if any
  if (cy) {
    cy.destroy();
  }

  // Initialize Cytoscape with the graph data
  cy = cytoscape({
    container: graphContainer,
    elements: graphData.elements,
    style: [
      // Node styles
      {
        selector: 'node',
        style: {
          'background-color': '#006064',
          'shape': 'data(nodeShape)',
          'width': 60,
          'height': 60,
          'border-width': 2,
          'border-color': '#004d40',
          'color': '#e0e0e0',
          'font-size': 14,
          'text-valign': 'bottom',
          'text-halign': 'center',
          'text-margin-y': 4,
          'content': 'data(label)'
        }
      },
      // Edge styles
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#004d40',
          'target-arrow-color': '#004d40',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
        }
      },
      // Selected node styling
      {
        selector: 'node:selected',
        style: {
          'background-color': '#00ced1',
          'line-color': '#00ced1',
          'target-arrow-color': '#00ced1',
          'source-arrow-color': '#00ced1'
        }
      },
      // Edge source styling during edge creation
      {
        selector: '.edge-source',
        style: {
          'border-color': '#ffeb3b',
          'border-width': 4,
        }
      }
    ],
    layout: {
      name: 'preset'
    },
    userZoomingEnabled: true,
    userPanningEnabled: true,
    zoomingEnabled: true,
    panningEnabled: true,
    minZoom: 0.1,
    maxZoom: 10,
    wheelSensitivity: 0.2
  });

  // Enable node dragging
  cy.nodes().grabify();

  // Set initial zoom and pan
  cy.ready(function() {
    if (cy.nodes().length > 0) {
      cy.zoom(1); // Set zoom level to 1 (default)
      cy.pan({ x: 0, y: 0 }); // Adjust pan to (0, 0)
    }
  });

  // Re-initialize event listeners and functionality here
  setupEventListeners();

  // Load the sequence
  sequence = graphData.sequence ? graphData.sequence.slice() : [];
  updateSequenceList();
}

// Function to setup event listeners
function setupEventListeners() {
  // Event listener for node selection
  cy.on('select unselect', 'node', function(event) {
    selectedNode = cy.$('node:selected').length > 0 ? cy.$('node:selected')[0] : null;
    updatePropertiesPanel(selectedNode);
  });

  // Initial properties panel setup
  if (cy.$('node:selected').length > 0) {
    selectedNode = cy.$('node:selected')[0];
    updatePropertiesPanel(selectedNode);
  } else {
    updatePropertiesPanel(null);
  }

  // Update the node's label in real-time
  cy.on('data', 'node', function(event) {
    const node = event.target;
    node.style('content', node.data('label'));
    updateSequenceList(); // Update sequence list to reflect label changes
  });

  // Handle clicking on nodes for edge creation
  cy.on('tap', 'node', function(event) {
    if (edgeCreationMode) {
      const targetNode = event.target;

      // Prevent creating an edge to the same node
      if (selectedNode.id() === targetNode.id()) {
        alert('Cannot create an edge to the same node.');
        return;
      }

      // Generate a unique ID for the new edge
      const newEdgeId = 'edge' + (cy.edges().length + 1);

      // Add the edge to the graph
      cy.add({
        group: 'edges',
        data: {
          id: newEdgeId,
          source: selectedNode.id(),
          target: targetNode.id()
        }
      });

      // Exit edge creation mode
      edgeCreationMode = false;
      graphContainer.style.cursor = 'default';

      // Remove visual feedback
      selectedNode.removeClass('edge-source');
    }
  });

  // Handle clicking on the background to cancel edge creation
  cy.on('tap', function(event) {
    if (edgeCreationMode && event.target === cy) {
      edgeCreationMode = false;
      graphContainer.style.cursor = 'default';

      // Remove visual feedback
      if (selectedNode) {
        selectedNode.removeClass('edge-source');
      }
    }
  });
}

// "Add to Sequence" button functionality
addToSequenceBtn.addEventListener('click', function() {
  if (selectedNode) {
    // Add node ID and annotation to sequence
    const nodeId = selectedNode.id();
    const annotation = selectedNode.data('annotation') || '';
    sequence.push({ nodeId, annotation });
    updateSequenceList();
  }
});

function updateSequenceList() {
  // Clear the list
  sequenceList.innerHTML = '';

  sequence.forEach((seqItem, index) => {
    const nodeId = seqItem.nodeId;
    const node = cy.getElementById(nodeId);
    if (node.length === 0) {
      // Node does not exist, remove it from the sequence
      sequence.splice(index, 1);
      return;
    }

    const listItem = document.createElement('li');

    // Sequence item label
    const labelSpan = document.createElement('span');
    labelSpan.className = 'sequence-item-label';
    labelSpan.textContent = node.data('label') || nodeId;

    // Click event to select the node in the graph
    labelSpan.addEventListener('click', function() {
      // Select the corresponding node in the graph
      cy.nodes().unselect();
      node.select();
    });

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-sequence-item-btn';
    removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    removeBtn.title = 'Remove from Sequence';

    // Click event to remove the sequence item
    removeBtn.addEventListener('click', function() {
      sequence.splice(index, 1);
      updateSequenceList();
    });

    // Append elements to the list item
    listItem.appendChild(labelSpan);
    listItem.appendChild(removeBtn);

    sequenceList.appendChild(listItem);
  });
}

// Event listener for "Add Graph" button
addGraphBtn.addEventListener('click', function() {
  const newGraphIndex = createNewGraph('Untitled Graph ' + (graphs.length + 1));
  switchGraph(newGraphIndex);
});

// Initialize the editor with a default graph
function init() {
  createNewGraph('Untitled Graph 1');
  renderLegend();
  switchGraph(0); // Switch to the first graph immediately
}

document.getElementById('download-btn').addEventListener('click', function() {
  // Save all graphs data
  saveAllGraphs();

  // Prepare the data to download
  const dataStr = JSON.stringify(graphs, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a temporary link element and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'graphs.json';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  // Clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
});

document.getElementById('load-btn').addEventListener('click', function() {
  // Create an input element to select the file
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const contents = e.target.result;
        const loadedGraphs = JSON.parse(contents);
        if (Array.isArray(loadedGraphs)) {
          // Replace the existing graphs with loadedGraphs
          graphs = loadedGraphs;

          // Reset current graph index and load the first graph
          currentGraphIndex = 0;
          loadGraph(graphs[currentGraphIndex]);
          renderLegend();
        } else {
          alert('Invalid file format: Expected an array of graphs.');
        }
      } catch (err) {
        console.error('Error parsing JSON:', err);
        alert('Error parsing JSON file. Please ensure it is in the correct format.');
      }
    };
    reader.readAsText(file);
  };

  // Trigger the file selection dialog
  input.click();
});

// Call init to set up the editor
init();

// Save the current graph before unloading the page
window.addEventListener('beforeunload', saveCurrentGraph);
