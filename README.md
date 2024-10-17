# Possible Futures Editor and Viewer 🚀

A web-based tool for creating and visualizing interconnected graphs representing possible futures or scenarios.

## Overview 📝

This project consists of two main components:

- **Editor** (`editor.html`): A web-based graph editor where you can create nodes, edges, and sequences, and annotate them.
- **Viewer** (`viewer.html`): A web-based graph viewer that displays the graphs and sequences created in the editor.

## Getting Started 🛠️

Due to CORS restrictions when loading local files, it's recommended to host this project using GitHub Pages. Follow the steps below to set up your own instance.

### 1. Fork the Repository 🍴

1. Navigate to the [repository](https://github.com/yourusername/yourrepo) on GitHub.
2. Click on the **Fork** button in the top-right corner to create your own copy of the repository.

### 2. Set Up GitHub Pages 🌐

1. In your forked repository, go to **Settings**.
2. Navigate to the **Pages** section.
3. Under **Source**, select `main` branch and `/ (root)` folder.
4. Click **Save**. GitHub Pages will provide a URL where your site is hosted, e.g., `https://yourusername.github.io/yourrepo/`.

### 3. Create Graphs Using the Editor 🎨

1. Open the editor by navigating to `https://yourusername.github.io/yourrepo/editor.html`.
2. Use the interface to add nodes, edges, and sequences:
   - **Add Nodes** ➕: Click on a node to select it, then click the **Add Node** button to add a new node connected to the selected node.
   - **Add Edges** 🔗: Select a node, click the **Add Edge** button, then click on another node to create an edge between them.
   - **Edit Properties** ✏️: With a node selected, edit its label, shape, and annotation in the properties panel.
   - **Sequence Nodes** 🔢: Select a node and click the **Add to Sequence** button to include it in the sequence.
   - **Manage Graphs** 🗂️: Use the **Add Graph** button to create new graphs. You can duplicate existing graphs using the copy icon 📄 in the legend.

3. When you're satisfied with your graphs, click the **Download** button 💾 to save them as a JSON file.

### 4. Upload Graph JSON Files ⬆️

1. In your repository on GitHub, navigate to the `graphs` folder. If it doesn't exist, create it.
2. Upload your saved JSON files to the `graphs` folder:
   - Click on **Add file** > **Upload files**.
   - Select your JSON file and commit the changes.

### 5. View Your Graphs 👀

1. Open the viewer by navigating to `https://yourusername.github.io/yourrepo/viewer.html`.
2. To view your graph, append the `data` URL parameter with the path to your JSON file:

https://yourusername.github.io/yourrepo/viewer.html?data=graphs/yourgraph.json


Replace `yourgraph.json` with the name of your uploaded JSON file.

3. The viewer will display your graphs and allow you to navigate through the sequences.

## Notes on CORS Issues 🚧

- **Why Host on GitHub Pages?**
- Loading local JSON files into the viewer may result in CORS (Cross-Origin Resource Sharing) errors due to browser security policies.
- Hosting your project on GitHub Pages serves the files over HTTP(S), avoiding these issues.

- **Accessing the Viewer:**
- Ensure that the `data` parameter points to a valid URL within your GitHub Pages site.
- Example: `viewer.html?data=graphs/yourgraph.json`

## Project Structure 📁

- `editor.html`: The graph editor interface.
- `viewer.html`: The graph viewer interface.
- `js/`: JavaScript files for functionality.
- `css/`: Stylesheets for styling the interfaces.
- `graphs/`: Folder to store your JSON graph files.

## Dependencies 📦

- [Cytoscape.js](https://js.cytoscape.org/): A JavaScript library for graph theory.
- [Font Awesome](https://fontawesome.com/): Icons used in the interface.

## Tips 💡

- **Unique IDs**: The editor ensures that all node and edge IDs are unique across graphs to prevent conflicts.
- **Data Format**: The viewer expects JSON files where nodes and edges have IDs prefixed with the graph ID.
- **Modifying Graphs**: You can duplicate graphs in the editor to create variations without starting from scratch.

## Contributing 🤝

Feel free to contribute to this project by submitting issues or pull requests to improve functionality and fix bugs.

## License 📄

This project is open-source and available under the [MIT License](LICENSE).
