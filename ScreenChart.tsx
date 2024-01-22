import React from "react";
import { styled } from "styled-components";
import LineChart from "./LineChart";

const ScreenChart = () => {
  const data = [
    { month: "1", weekOfMonth: "1", avgInterestRate: "3.77" },
    { month: "1", weekOfMonth: "2", avgInterestRate: "3.59" },
    { month: "1", weekOfMonth: "3", avgInterestRate: "3.59" },
    { month: "1", weekOfMonth: "4", avgInterestRate: "4.26" },
    { month: "1", weekOfMonth: "5", avgInterestRate: "5.54" },
    { month: "2", weekOfMonth: "1", avgInterestRate: "4.37" },
    { month: "2", weekOfMonth: "2", avgInterestRate: "4.21" },
    { month: "2", weekOfMonth: "3", avgInterestRate: "4.55" },
  ];
  return (
    <StyledWrapper>
      <LineChart data={data} />
    </StyledWrapper>
  );
};

export default ScreenChart;

const StyledWrapper = styled.div`
  width: 600px;
  padding: 80px;
  margin: auto;
  display: flex;
  justify-content: center;
`;
