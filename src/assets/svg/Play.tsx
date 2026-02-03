import * as React from "react"
import Svg, { Circle, Path } from "react-native-svg"
const Play = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={35}
    height={35}
    fill="none"
    {...props}
  >
    <Circle cx={17.5} cy={17.5} r={17.5} fill="#fff" />
    <Path fill="#000" d="M13.5 25.5v-15L24 18l-10.5 7.5Z" />
  </Svg>
)
export default Play
