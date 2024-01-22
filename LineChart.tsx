import React, { useEffect, useRef, useState } from "react";
import { createLineChart } from "./util";

const LineChart = ({ data }) => {
  const d3Container = useRef(null);
  const [parentWidth, setParentWidth] = useState(600);

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
      createLineChart(data, d3Container, parentWidth);
    }
  }, [data, parentWidth]);

  return <div ref={d3Container} />;
};
export default LineChart;
