import * as d3 from "d3";


const w = 1000;
const h = 500;
const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json'
const margin = {
  top: 20,
  bottom: 60,
  left: 60,
  right: 20
}
const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;
const tooltip = d3.select('body')
        .append('div')
        .attr("id", "tooltip")
        .classed('tooltip', true);

const svg = d3.select('.container').append('svg')
        .attr('id', 'chart')
        .attr('width', w)
        .attr('height', h);

const chart = svg.append('g')
        .classed('display', true)
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

chart.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -200)
        .attr('y', 40)
        .text('Gross Domestic Product')

chart.append('text')
        .attr('x', width/2)
        .attr('y', height + 50)
        .attr('class', 'info')
        .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')

async function init() {
  try {
    const response  = await fetch(url);
    const result = await response.json();
    const data = result.data.map(elm => ({date: elm[0], value: elm[1]}));
    const dLength = data.length;
    const barWidth = width/dLength;

    const yearsDate = data.map(elm => new Date(elm.date));
    const maxDate = d3.max(yearsDate);
    
    const GDP = data.map(elm => elm.value);
    const linearScale = d3.scaleLinear()
        .domain([0, d3.max(GDP)])
        .range([0, height]);
    const scaledGDP = GDP.map(elm => linearScale(elm));
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(GDP)])
        .range([height,0])
    
    const x = d3.scaleTime()
        .domain([d3.min(yearsDate), maxDate])
        .range([0, width]);
    
    const xAxis = d3.axisBottom(x)
    const yAxis = d3.axisLeft(y)
    
    const linearColorScale = d3.scaleLinear()
        .domain([0, dLength])
        .range(["#5ee4ff", "#083fa3"])
    
    this.append('g')
        .classed('axis', true)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)

    this.append('g')
        .classed('axis', true)
        .attr('id', 'y-axis')
        .attr('transform', `translate(0, 0)`)
        .call(yAxis)
    
    this.selectAll('.bar')
        .data(scaledGDP)
        .enter()
        .append('rect')
          .classed('bar', true)
          .attr("height", 1)
          .attr("y", 420)
          .attr("x", 920)
			    .transition()
			    .duration(200)
          .delay((d, i) => i * 10)
          .attr('x', (d, i) => x(yearsDate[i]))
          .attr('y', d => height - d)
          .attr('width', d => barWidth)
          .attr('height', d => d)
          .attr('data-date', (d, i) => data[i].date)
          .attr('data-gdp', (d, i) => data[i].value)
          .attr('transform', 'translate(0, 0)')
          .style('fill', '#19ccb8')
          .style('stroke', '#107569');
    
    this.selectAll('.bar')
          .on('mouseover', showTooltip)
          .on('touchstart', showTooltip)
          .on('mouseout', hideTooltip)
          .on('touchend', hideTooltip)
    

    function showTooltip(d,i) {
      tooltip
        .style('opacity', 1)
        .style('left', d3.event.x -(tooltip.node().offsetWidth / 2) + 'px')
        .style('top', d3.event.y + -100 + 'px')
        .attr('data-date', data[i].date)
        .html(`
<p><strong>Date:</strong> ${data[i].date}</p>
<p><strong>GDP:</strong> $${GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')} Billion</p>
`);
    }
  
    function hideTooltip() {
      tooltip
        .style('opacity', 0)
    }
    
} catch(e) {
    console.log(e)
  }
}

init.call(chart)

