var svg_ = document.getElementById('svg')
var svg = d3.select("svg"),
    width = 2920
    height = 1580
var aspect = height / width

// 表示サイズを調整
d3.select(window)
  .on("resize", function() {
    var targetWidth = chart.node().getBoundingClientRect().width;
  chart.attr("width", targetWidth);
  chart.attr("height", targetWidth / aspect);

  });

var color = d3.scaleOrdinal(d3.schemeCategory20);

// 力学グラフの物理演算の設定を行う
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; })  .distance(function(){ return 100;}).strength(function(){ return 2; }))
    .force("charge", d3.forceManyBody().strength(function() { return -70; }) )
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(function(d){return d.count + 20}).iterations(2))

// JSONデータを取得しバインディングする
d3.json("./data.js", function(error, graph) {
  if (error) throw error;

  if(graph.status !== 'success'){
    d3.select("#clustering").remove()
    return null
  }else{
    graph = graph.report
  }

  // 力学グラフのリンク線の設定
  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return 0.5 });
    // .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    // ノードの設定
    var node = svg.append('g')
      .attr("class", 'node')
      .selectAll("node")
      .append('g')
      .attr("class", 'nodes')
      .data(graph.nodes)
      .enter()
      .append('g')
      .attr("class", 'nodes')
      .call(
          d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
        .on("mouseover", function(d) {
            d3.select("#selectWord").text(d.id);
            d3.selectAll("#relationWord tr").remove()
            graph.links.forEach(function(val,index,ar) {
              if(val.source.id == d.id){
                var tableRow = d3.select("#relationWord")
                  .append("tr")

                  tableRow.append("td").text(val.target.id )
                  tableRow.append("td").text(val.value )
                // d3.select("#relationWord tr").append("td").text(val.value )
              }
            });
          });

      // ノードにくっつく●の大きさなどの設定
      node.append("svg:circle")
      .attr("r", function(d){return d.count + 10})
      .attr("class", 'nodes')
      .attr("fill", function(d) { return color(d.group); })

      // ノードにくっつく文字の設定
      node.append("svg:text")
      .attr("class", "nodetext")
      .text(function(d) { return d.id })



  // ノードをClickした時の設定
  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
    .attr("transform", function(d) { return 'translate('+d.x+', '+d.y+ ')'; })
    .attr("y", function(d) { return d.y; })
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
