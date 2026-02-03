import * as React from "react"
import Svg, { Circle, Path } from "react-native-svg"
const Pause = () => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={35}
    height={35}
    fill="none"
   >
    <Circle cx={17.5} cy={17.5} r={17.5} fill="#fff" />
    <Path fill="#000" d="M12 11h3v14h-3zM20 11h3v14h-3z" />
  </Svg>
)
export default Pause
