import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";

const LineChart = ({ data }) => {
  const d3Container = useRef(null);
  const [parentWidth, setParentWidth] = useState(600);

  const colorOrange = "#ff6c00";
  const colorGray = "#707882";
  const colorLightGray = "#edeef0";

  const createLineChart = (data, d3Container) => {
    const margin = {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    };
    const width = parentWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // svg 요소 초기화
    d3.select(d3Container.current).selectAll("*").remove();

    // svg 요소 생성
    const svg = d3
      .select(d3Container.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // 데이터 포맷팅 - X축 값을 월주차 형태로 변환
    const formattedData = data.map((d) => ({
      ...d,
      xValue: `${d.month}월 ${d.weekOfMonth}주`,
      yValue: parseFloat(d.avgInterestRate),
    }));

    // x축 스케일 설정
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(formattedData.map((d) => d.xValue))
      .padding(0.1);

    // y축 스케일 설정
    const yMin = d3.min(formattedData, (d) => d.yValue);
    const yMax = d3.max(formattedData, (d) => d.yValue);

    // 전체 범위를 4개의 동일한 구간으로 나누기
    const yRange = yMax - yMin;
    const interval = yRange / 4;
    const padding = Math.round(interval * 100) / 100;

    // y축 스케일 설정
    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([yMin - padding, yMax + padding]);

    // y축 그리드 라인 추가
    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(y).ticks(4).tickSize(-width).tickFormat("").tickSizeOuter(0)
      )
      .selectAll(".tick line")
      .attr("stroke", colorLightGray)
      .attr("stroke-dasharray", "2.2");

    // x축 추가 및 축 라인 색상 변경
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(15))
      .selectAll("path, line") // 축의 라인만 선택
      .attr("stroke", colorGray); // 축 라인 색상 설정

    // y축 추가 및 축 라인 색상 변경
    svg
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(0)
          .tickSizeOuter(0)
          .tickPadding(10)
          .tickFormat((y) => `${y.toFixed(2)}%`)
      )
      .selectAll("path, line") // 축의 라인만 선택
      .attr("stroke", colorGray); // 축 라인 색상 설정

    // x, y축 text 색상 변경
    svg
      .selectAll(".domain, .tick text") // y축의 텍스트 선택
      .attr("fill", colorGray); // 축 텍스트 색상 설정

    // 라인 생성
    const line = d3
      .line()
      .x((d) => x(d.xValue) + x.bandwidth() / 2)
      .y((d) => y(d.yValue));

    // 라인 path 생성
    const path = svg
      .append("path")
      .data([formattedData])
      .attr("fill", "none")
      .attr("stroke", colorOrange)
      .attr("stroke-width", 2)
      .attr("d", line);

    // 애니메이션을 위한 라인 길이 계산
    const totalLength = path.node().getTotalLength();

    // 라인 그리기
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .attr("stroke-dashoffset", 0);

    // 각 데이터 포인트에 흰색 테두리를 가진 텍스트 추가
    svg
      .selectAll(".data-text-bg")
      .data(formattedData)
      .enter()
      .append("text")
      .attr("class", "data-text-bg")
      .attr("x", (d) => x(d.xValue) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.yValue) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px") // 흰색 테두리용 텍스트 크기
      .attr("fill", "white") // 흰색 테두리 색상
      .text((d) => `${d.yValue.toFixed(2)}%`);

    // 각 데이터 포인트에 텍스트 추가
    svg
      .selectAll(".data-text")
      .data(formattedData)
      .enter()
      .append("text")
      .attr("class", "data-text")
      .attr("x", (d) => x(d.xValue) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.yValue) - 10) // 데이터 포인트 위에 위치하도록 조정
      .attr("text-anchor", "middle") // 텍스트를 중앙 정렬
      .attr("font-size", "12px") // 텍스트 크기 설정
      .attr("font-weight", "bold")
      .attr("fill", colorOrange)
      .text((d) => `${d.yValue.toFixed(2)}%`); // yValue를 텍스트로 표시

    // 툴팁 설정
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "black")
      .style("color", "white")
      .style("border-radius", "5px")
      .style("padding", "8px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("line-hight", "2")
      .style("z-index", 100);

    // 마우스 이동 함수
    const mousemove = (event) => {
      const pointer = d3.pointer(event);
      const hoverX = pointer[0];
      let closestIndex;
      let closestDistance = Infinity;

      // 가장 가까운 x축 데이터 포인트 찾기
      formattedData.forEach((d, i) => {
        const xPosition = x(d.xValue) + x.bandwidth() / 2;
        const distance = Math.abs(hoverX - xPosition);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });

      const closestData = formattedData[closestIndex];
      const svgPosition = d3Container.current.getBoundingClientRect();

      // 차트 높이의 70% 계산
      const threshold = height * 0.3;

      // 툴팁 위치 계산
      const tooltipX =
        svgPosition.left +
        x(closestData.xValue) +
        x.bandwidth() / 2 +
        margin.left;
      let tooltipY;

      // 툴팁에 삼각형 추가
      const triangleSize = 10; // 삼각형의 크기
      let trianglePath;

      if (y(closestData.yValue) < threshold) {
        // 데이터가 높이의 60% 이상에 위치한 경우, 툴팁을 아래쪽에 표시
        tooltipY = svgPosition.top + y(closestData.yValue) + margin.top + 55;

        trianglePath = `M0,0 L${triangleSize / 2},${triangleSize} L-${
          triangleSize / 2
        },${triangleSize} Z`;
      } else {
        // 그렇지 않은 경우, 툴팁을 위쪽에 표시
        tooltipY = svgPosition.top + y(closestData.yValue) + margin.top - 10;

        trianglePath = `M0,0 L${triangleSize / 2},-${triangleSize} L-${
          triangleSize / 2
        },-${triangleSize} Z`;
      }

      // 툴팁 위치를 데이터 포인트에 고정
      tooltip
        .html(
          `<div>${
            closestData.xValue
          }</div><div style='padding-top: 5px;'>보상률: ${closestData.yValue.toFixed(
            2
          )}%</div>`
        )
        .style("left", tooltipX + "px")
        .style("top", tooltipY + "px")
        .style("transform", "translate(-50%, -100%)");

      // 데이터 포인트에 점 추가
      svg.selectAll(".hover-dot").remove();
      svg
        .append("circle")
        .attr("class", "hover-dot")
        .attr("cx", x(closestData.xValue) + x.bandwidth() / 2)
        .attr("cy", y(closestData.yValue))
        .attr("r", 5)
        .attr("fill", colorOrange);

      svg.selectAll(".tooltip-triangle").remove();
      svg
        .append("path")
        .attr("class", "tooltip-triangle")
        .attr("d", trianglePath)
        .attr("fill", "black") // 삼각형의 색상을 툴팁과 동일하게 설정
        .attr("transform", () => {
          const xPosition = x(closestData.xValue) + x.bandwidth() / 2;
          const yPosition = y(closestData.yValue) - 10;
          return `translate(${xPosition}, ${yPosition + triangleSize})`; // 삼각형 위치 조정
        });
    };

    // 마우스 오버 이벤트 설정
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .style("z-index", 100)
      .on("mouseover", () => {
        tooltip.style("opacity", 1);
      })
      .on("mouseout", (event) => {
        // 차트 영역 밖으로 마우스가 이동했는지 확인
        const mouseEvent = d3.pointer(event);
        if (
          mouseEvent[0] < 0 ||
          mouseEvent[0] > width ||
          mouseEvent[1] < 0 ||
          mouseEvent[1] > height
        ) {
          // 마우스가 차트 영역 밖으로 벗어난 경우에만 툴팁과 점 제거
          tooltip.style("opacity", 0);
          svg.selectAll(".hover-dot").remove();
          svg.selectAll(".tooltip-triangle").remove();
        }
      })
      .on("mousemove", mousemove);
  };

  useEffect(() => {
    if (d3Container.current) {
      // 부모 컴포넌트의 너비 감지
      const resizeObserver = new ResizeObserver((entires) => {
        if (entires.length === 0) {
          return;
        }
        setParentWidth(entires[0].contentRect.width);
      });
      resizeObserver.observe(d3Container.current);

      // 클린업 함수
      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (data && d3Container.current) {
      createLineChart(data, d3Container);
    }
  }, [data, parentWidth]);

  return <div ref={d3Container} />;
};
export default LineChart;
