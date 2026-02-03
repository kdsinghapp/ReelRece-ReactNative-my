import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { t } from 'i18next'

const SettingLogOut = () => {
  return (
    <View>
      <Text>  
                    {(t("home.settingLogOut"))}
      </Text>
    </View>
  )
}

export default React.memo(SettingLogOut)

const styles = StyleSheet.create({})