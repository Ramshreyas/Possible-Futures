// Variables and DOM elements
const nodeLabelInput = document.getElementById('node-label');
const nodeShapeSelect = document.getElementById('node-shape');
const nodeAnnotationInput = document.getElementById('node-annotation');
const textArea = document.getElementById('text-area');
const addNodeBtn = document.getElementById('add-node-btn');
const deleteElementBtn = document.getElementById('delete-element-btn');

let selectedNode = null;

// Update properties panel
function updatePropertiesPanel(node) {
  if (node) {
    nodeLabelInput.value = node.data('label') || '';
    nodeShapeSelect.value = node.data('nodeShape') || 'ellipse';
    nodeAnnotationInput.value = node.data('annotation') || '';
    nodeLabelInput.disabled = false;
    nodeShapeSelect.disabled = false;
    nodeAnnotationInput.disabled = false;
    textArea.textContent = node.data('annotation') || '';
  } else {
    nodeLabelInput.value = '';
    nodeShapeSelect.value = 'ellipse';
    nodeAnnotationInput.value = '';
    nodeLabelInput.disabled = true;
    nodeShapeSelect.disabled = true;
    nodeAnnotationInput.disabled = true;
    textArea.textContent = '';
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

  // **Add this code to create an edge between the selected node and the new node**
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
  } else {
    alert('Please select a node to delete.');
  }
});

// Variables to store graphs and the current graph index
let graphs = [];
let currentGraphIndex = 0;

// **Define saveCurrentGraph before it's called**
// Function to save the current graph's elements
function saveCurrentGraph() {
  if (window.cy) {
    graphs[currentGraphIndex].elements = cy.json().elements;
  }
}

// DOM Elements
const graphContainer = document.getElementById('graph-container');
const legend = document.getElementById('legend');
const addGraphBtn = document.createElement('div');
addGraphBtn.className = 'add-graph-btn';
addGraphBtn.innerHTML = '<i class="fas fa-plus-circle"></i>&nbsp;Add Graph';

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
  if (window.cy) {
    cy.destroy();
  }

  // Initialize Cytoscape with the graph data
  window.cy = cytoscape({
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
  });
}

// Event listener for "Add Graph" button
addGraphBtn.addEventListener('click', function() {
  const newGraphIndex = createNewGraph('Untitled Graph ' + (graphs.length + 1));
  switchGraph(newGraphIndex);
});

// **Moved saveCurrentGraph before it's called in switchGraph**
// Function to save the current graph's elements
function saveCurrentGraph() {
  if (window.cy) {
    graphs[currentGraphIndex].elements = cy.json().elements;
  }
}

// Initialize the editor with a default graph
function init() {
  createNewGraph('Untitled Graph 1');
  renderLegend();
  switchGraph(0); // Switch to the first graph immediately
}

// Call init to set up the editor
init();

// Save the current graph before unloading the page
window.addEventListener('beforeunload', saveCurrentGraph);