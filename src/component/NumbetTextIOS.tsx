import React from "react";
import Svg, { Text as SvgText } from "react-native-svg";
 
const OutlineTextIOS = ({
  text = "1",
  fontSize = 70,
  fillColor = "#000",       // inner fill
  strokeColor = "#FFF",     // outline
  strokeWidth = 2,     
}) => {
  return (
    <Svg height={fontSize + 20} width={parseInt(text)  < 10 ?  fontSize   :
    
    parseInt(text)  < 100 ?    fontSize * 1.5  :  
    fontSize * 1.9}>
      <SvgText
        x="50%"
        y="80%"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      
        fontSize={fontSize}
        fontWeight="bold"
        fontFamily="Poppins-Bold"
        textAnchor="middle"
      >
        {text}
      </SvgText>
    </Svg>
  );
};
 
export default OutlineTextIOS;