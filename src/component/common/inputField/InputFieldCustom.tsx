// import { View, TextInput, Image, TouchableOpacity } from 'react-native';
// import React, { useRef, useState } from 'react';
// import imageIndex from '@assets/imageIndex';
// import { Color } from '@theme/color';

// export default function InputFieldCustom({ validSuccess, ...props }) {
//   const [showPassword, setShowPassword] = useState(props.hide );
//   const [isFocused, setIsFocused] = useState(false);
//   const inputRef = useRef(null);
//   const onChangeText = (value: string) => {
//     if (props.onChangeText) {
//       props.onChangeText(value);
//     }
//   };

//   return (
//     <View style={{ marginVertical: 12 }}>
//       <View style={{ position: 'relative' }}>
//         <View
//           style={[
//             {
//               flexDirection: 'row',
//               backgroundColor: Color.grey,
//               height: 55,
//               borderRadius: 10,
//               paddingHorizontal: 10,
//               alignItems: 'center',
//               borderWidth: 0.5,
//               borderColor: isFocused ? Color.whiteText : 'transparent',
//             },
//             props.style,
//           ]}
//         >
//           <TextInput
//             placeholder={props.placeholder}
//             placeholderTextColor={Color.lightGrayText}
//             ref={inputRef}
//             style={{
//               flex: 1,
//               fontWeight: '500',
//               fontSize: 16,
//               paddingTop: 10,
//               color: Color.whiteText,
//               height: 50,
//             }}
//             onChangeText={onChangeText}
//             value={props.text}
//             secureTextEntry={showPassword} // ✅ Correct usage
//             maxLength={props.maxLength}
//             keyboardType={props.type}
//             onFocus={() => setIsFocused(true)}
//             onBlur={() => setIsFocused(false)}
//             editable={props.editable}
//             autoFocus={false}
//             returnKeyType={props.returnKeyType}
//             onSubmitEditing={props.onSubmitEditing}
//           />

//           {/* Eye Icon Toggle */}
//           {props.showEye && (
//             <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//               <Image
//                 source={showPassword ? imageIndex.eyes : imageIndex.view}
//                 style={{ width: 24, height: 24 }}
//                 tintColor={'rgba(205, 205, 205, 1)'}
//               />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// }

import { View, TextInput, Image, TouchableOpacity } from 'react-native';
import React, { useRef, useState } from 'react';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';

export default function InputFieldCustom({ validSuccess, ...props }) {
  const [showPassword, setShowPassword] = useState(props.hide);
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(props.text || ""); //  local state for text
  const inputRef = useRef(null);

  const onChangeText = (value: string) => {
    setText(value); // local update
    if (props.onChangeText) {
      props.onChangeText(value); // parent callback bhi trigger
    }
  };

  // 🔑 Border show hone ki condition
  const showBorder = isFocused || text.length > 0;

  return (
    <View style={{ marginVertical: 12 }}>
      <View style={{ position: 'relative' }}>
        <View
          style={[
            {
              flexDirection: 'row',
              backgroundColor: Color.grey,
              height: 50,
              borderRadius: 10,
              paddingHorizontal: 10,
              alignItems: 'center',
              borderWidth: 0.8,
              borderColor: showBorder ? Color.whiteText : 'transparent', // ✅ use condition here
            },
            props.style,
          ]}
        >
          <TextInput
            placeholder={props.placeholder}
            placeholderTextColor={Color.lightGrayText}
            ref={inputRef}
            style={{
              flex: 1,
              // fontWeight: '500',
              fontFamily:font.PoppinsRegular,
              fontSize: 16,
               color: Color.whiteText,
              height: 50,
            }}
            onChangeText={onChangeText}
            value={text}
            secureTextEntry={showPassword}
            maxLength={props.maxLength}
            keyboardType={props.type}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            editable={props.editable}
            autoFocus={false}
            returnKeyType={props.returnKeyType}
            onSubmitEditing={props.onSubmitEditing}
                   allowFontScaling={false} 
          />

          {/* Eye Icon Toggle */}
          {props.showEye && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image
                source={showPassword ? imageIndex.eyes : imageIndex.view}
                style={{ width: 24, height: 24 }}
                tintColor={'rgba(205, 205, 205, 1)'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
