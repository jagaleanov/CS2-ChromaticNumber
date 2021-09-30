// JavaScript Document

class Node {
    constructor(id, x, y, finalWeight = null) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.finalWeight = finalWeight;
        this.totalWeight = 0;
        this.color = null;
    }
}

class Graph {
    constructor() {
        this.nodesList = [];
        this.edgesMatrix = [];
        this.nodeCounter = 0;
        this.chromaticNumber = 0;
        this.tree = null;
        this.permArr = [];
        this.usedChars = [];
    }

    setMatrix() {
        this.edgesMatrix = [];
        for (let i = 1; i <= this.nodeCounter; i++) {
            this.edgesMatrix[i] = [];
            for (let j = 1; j <= this.nodeCounter; j++) {
                this.edgesMatrix[i][j] = null;
            }
        }
    }

    insertNode(x, y) {
        this.nodeCounter++;
        let newNode = new Node(this.nodeCounter, x, y);
        this.nodesList[this.nodeCounter] = newNode;
        this.setMatrix();
    }

    insertEdge(weight, from, to) {
        this.edgesMatrix[from][to] = weight;
    }

    groups(orderList) {
        let groups = [];
        groups[0] = [orderList[0]];

        for (let i = 1; i < orderList.length; i++) {
            let groupAdjacency = false;
            for (let j = 0; j < groups.length; j++) {
                let adjacency = false;
                for (let k = 0; k < groups[j].length; k++) {

                    if (this.edgesMatrix[orderList[i]][groups[j][k]] == 1) {//si orderList[i] es adyacente a groups[j][k]
                        adjacency = true;
                        break;
                    }
                }

                if (!adjacency) {
                    groups[j].push(orderList[i]);
                    groupAdjacency = true;
                    break;
                }

            }

            if (!groupAdjacency) {
                groups.push([orderList[i]]);
            }


        }

        return groups;
    }

    color() {

        let valueList = []
        for (let i = 1; i < this.nodesList.length; i++) {
            valueList.push(this.nodesList[i].id);

        }

        let matrixPermutations = this.permute(valueList);

        let dataColor = [];
        for (let i = 0; i < matrixPermutations.length; i++) {
            let groups = this.groups(matrixPermutations[i]);

            dataColor.push({
                permutation: matrixPermutations[i],
                colorNumber: groups.length,
                groups: groups
            });
        }


        let min = Number.MAX_VALUE;
        let permutation = [];
        let groups = [];
        for (let i = 0; i < dataColor.length; i++) {
            if (dataColor[i].colorNumber < min) {
                min = dataColor[i].colorNumber;
                permutation = dataColor[i].permutation;
                groups = dataColor[i].groups;
            }

        }

        for (let i = 1; i < this.nodesList.length; i++) {
            for (let j = 0; j < groups.length; j++) {
                if (groups[j].indexOf(this.nodesList[i].id) > -1) {

                    this.nodesList[i].color = j;

                }

            }
            
        }
        console.log('nodesList', this.nodesList);

        return "El número cromático es " + min + " a partir de la permutación " + permutation.join(', ');
    }



    permute(input) {
        var i, ch;
        for (i = 0; i < input.length; i++) {
            ch = input.splice(i, 1)[0];
            this.usedChars.push(ch);
            if (input.length == 0) {
                this.permArr.push(this.usedChars.slice());
            }
            this.permute(input);
            input.splice(i, 0, ch);
            this.usedChars.pop();
        }
        return this.permArr
    };
}










const graph1 = new Graph();
let insertData = true;

function insertNode(x, y) {
    if (insertData == true) {
        graph1.insertNode(x, y);
        drawTable();
        drawGraph(graph1, 'network1');
    }
}

function insertEdges() {
    for (let i = 1; i <= graph1.edgesMatrix.length; i++) {
        for (let j = 1; j <= graph1.edgesMatrix.length; j++) {
            if ($('#edge_' + i + '_' + j).val() == 1) {
                let val = $('#edge_' + i + '_' + j).val();
                graph1.insertEdge(parseInt(val), i, j)
            }
        }
    }
    insertData = false;
    for (let i = 1; i < graph1.nodesList.length; i++) {
        for (let j = 1; j < graph1.nodesList.length; j++) {
            $('#edge_' + i + '_' + j).attr("readonly", true);
            $("#setEdgesBtn").attr("disabled", true);
        }
    }
    $("#chromaticNum").html(graph1.color());
    drawGraph(graph1, 'network1');



}

function drawGraph(graph, divId) {


    let colorHexa = ['#FFFFFF', '#FF0101', '#D7DF01', '#67934D', '#00DFD6', '#afa2ff', '#FFF01F', '#00FF00', '#FE00FE', '#FF5964', '#2E9AFE', '#F4A9A8', '#6E6F6F', '#F5FA59', '#BE81F7', '#DE7501'];

    // create an array with nodes
    let nodesData = [];
    let nodesList = graph.nodesList;
    for (let i = 1; i < nodesList.length; i++) {
        let node = nodesList[i];

        nodesData.push({
            id: node.id,
            label: node.id.toString(),
            x: node.x,
            y: node.y,
            color: { background: colorHexa[node.color] },
            font: { color: '#000' }
        });

    }
    let nodes = new vis.DataSet(nodesData);

    // create an array with edges
    let edgesData = [];
    let edgesMatrix = graph.edgesMatrix;
    for (let i = 1; i <= edgesMatrix.length; i++) {
        if (Array.isArray(edgesMatrix[i]) && edgesMatrix[i].length > 0) {
            for (let j = 0; j < edgesMatrix[i].length; j++) {
                if (edgesMatrix[i][j] !== NaN && edgesMatrix[i][j] !== null) {
                    edgesData.push({ from: i, to: j });
                }
            }
        }
    }
    let edges = new vis.DataSet(edgesData);

    // create a network
    let container = document.getElementById(divId);

    // provide the data in the vis format
    let data = {
        nodes: nodes,
        edges: edges
    };
    let options = {
        edges: {
            smooth: false
        },
        physics: false,
        interaction: {
            dragNodes: false,
            zoomView: false,
            dragView: false
        }
    };

    // initialize your network!
    let network = new vis.Network(container, data, options);
    network.on('click', function (e) { onClick(e) });

    /* DEFINE CALLBACKS HERE */
    function onClick(e) {
        insertNode(e.pointer.canvas.x, e.pointer.canvas.y);
    }
}

function drawTable() {
    let html =

        '<thead class="thead-dark"><tr>';
    html += '<th></th>';
    for (let i = 1; i < graph1.nodesList.length; i++) {
        html +=
            '<th>' + i + '</th>';
    }
    html +=
        '</tr></thead><tbody>';
    for (let i = 1; i < graph1.nodesList.length; i++) {
        html += "<tr>";
        html += "<th>" + i + "</th>";
        for (let j = 1; j < graph1.nodesList.length; j++) {
            html += "<td>";

            if (j > i) {
                html +=
                    '<div class="form-group">' +
                    '<select name="edge_' + i + '_' + j + '" id="edge_' + i + '_' + j + '" class="form-control" onChange="copyField(' + i + ',' + j + ')">';
                for (let k = 0; k <= 1; k++) {
                    html += '<option value="' + k + '">' + k + '</option>';
                }

                html += '</select>'
                '</div>';
            } else if (j == i) {
                html +=
                    '<div class="form-group">' +
                    '<input type="text" name="edge_' + i + '_' + j + '" id="edge_' + i + '_' + j + '" value="-----" class="form-control" readonly>'
                '</div>';
            } else {
                html +=
                    '<div class="form-group">';
                html +=
                    '<div class="form-group">' +
                    '<input type="text" value="0" name="edge_' + i + '_' + j + '" id="edge_' + i + '_' + j + '" class="form-control" readonly>'
                '</div>';
                '</div>';
            }


            html += "</td>";
        }
        html += "</tr>";
    }
    html +=
        '</tbody>';
    $('#edgesTable').html(html);
}

function copyField(i, j) {
    $('#edge_' + j + '_' + i + '').val($('#edge_' + i + '_' + j + '').val());
}

drawGraph(graph1, 'network1');