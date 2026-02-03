import { BASE_IMAGE_URL } from "@config/api.config";

  <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      {/* <View style={{ flex: 1 }}>
  <FastImage
    source={{ uri: activeMovieImage }}
    // style={styles.backgroundImage}
    style={{flex:1}}
    resizeMode={FastImage.resizeMode.cover}
  /> */}
      {/* <ImageBackground
        // source={{ uri : `${BASE_IMAGE_URL}${activeMovieImage}`  }}
        source={{ uri: `${activeMovieImage}` }}
        style={{ flex: 1 }}
        blurRadius={1.2}
        resizeMode='stretch'
        imageStyle={{ opacity: 0.8, backgroundColor: 'black' }}
      > */}

      <ImageBackground
        source={
          // error
          // ? require(imageIndex.Welcomeupdate)
          // : 
          { uri: `${activeMovieImage}` }
        }
        style={styles.bg}
        blurRadius={3}
        resizeMode="cover"
        imageStyle={{ opacity: 0.4, backgroundColor: Color.background }}
        onLoadStart={() => {
          setLoading(true);
          setError(false);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      >

        {/* Overlay with opacity */}
        <View style={{
          ...StyleSheet.absoluteFillObject,
          // backgroundColor:"rgba(158, 3, 3, 0.4)",
          // backgroundColor:'green'
        }} />
        {/* Your content goes here */}
        {/* <Text>Something on top of background</Text> */}
        <SafeAreaView style={[styles.mincontainer, { paddingBottom: isKeyboardVisible ? 0 : 0 }]}>
          <CustomStatusBar translucent={true} />

          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, }}>
              <TouchableOpacity onPress={() => navigation.goBack()} >
                <Image source={imageIndex.backArrow} style={{ height: 24, width: 24, marginRight: 12, }} resizeMode='contain' />

              </TouchableOpacity>
              {/* <Text style={styles.title} numberOfLines={1} >{group_name ?? 'Group Name'}</Text> */}

              <CustomText
                size={16}
                color={Color.whiteText}
                style={styles.title}
                font={font.PoppinsBold}
                numberOfLines={1}
              >
                {group_name ?? 'Group Name'}
              </CustomText>
            </View>

            <View style={{ flexDirection: "row", }}>
              <TouchableOpacity onPress={() => setNotificationModal(true)}>
                <Image source={imageIndex.normalNotification} style={{
                  height: 22,
                  width: 22,
                  right: 12
                }} resizeMode='contain' />

              </TouchableOpacity>
              <TouchableOpacity onPress={() => setGroupSettingModal(true)}>
                <Image source={imageIndex.menu} style={{
                  height: 22,
                  width: 22
                }} />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <TouchableOpacity onPress={() => setGroupMember(true)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, justifyContent: 'center' }}>

              {/* {group.groupuser.slice(0, 1).map((user, index) => (
                <Image
                  key={index}
                  source={user.userImage}
                  style={{
                    height: 18,
                    width: 18,
                    borderRadius: 20,
                    marginRight: -4,
                  }}
                />
              ))} */}

              {type === 'createGroup'
                ?
                // group.groupName?.slice(0).map((user, index) => (
                group.members?.slice(0).map((user, index) => (
                  // <Image
                  //   key={index + 1}
                  //   source={{ uri: `${BASE_IMAGE_URL}${user.avatar}` }}
                  //   style={{
                  //     height: 18,
                  //     width: 18,
                  //     borderRadius: 20,
                  //     marginRight: -4,
                  //   }}
                  // />


                  <FastImage
                    key={index + 1}
                    style={{
                      height: 18,
                      width: 18,
                      borderRadius: 20,
                      marginRight: -4,
                    }}
                    source={{
                      uri: `${BASE_IMAGE_URL}${user.avatar}`,
                      priority: FastImage.priority.low,
                      cache: FastImage.cacheControl.immutable,
                    }}
                  // resizeMode={FastImage.resizeMode.cover}
                  />
                )) :

                group.members.slice(0).map((user, index) => (
                  // <Image
                  //   key={index + 1}
                  //   source={{ uri: `${BASE_IMAGE_URL}${user.avatar}` }}
                  //   style={{
                  //     height: 18,
                  //     width: 18,
                  //     borderRadius: 20,
                  //     marginRight: -4,
                  //   }}
                  // />


                  <FastImage
                    key={index + 1}
                    style={{
                      height: 18,
                      width: 18,
                      borderRadius: 20,
                      marginRight: -4,
                    }}
                    source={{
                      uri: `${BASE_IMAGE_URL}${user.avatar}`,
                      priority: FastImage.priority.low,
                      cache: FastImage.cacheControl.immutable,
                    }}
                  // resizeMode={FastImage.resizeMode.cover}
                  />
                ))
              }

              {type === 'createGroup'
                ?
                // <Text style={{ color: Color.whiteText, fontSize: 12, marginLeft: 10 }}>{group?.groupName?.trim() || 'Unnamed'} </Text>
                // <Text style={{ color: Color.whiteText, fontSize: 12, marginLeft: 10 }}>{group?.members[0] || 'Unnamed'} </Text>
                <CustomText
                  size={12}
                  color={Color.whiteText}
                  style={{ marginLeft: 10 }}
                  font={font.PoppinsRegular}
                  numberOfLines={1}
                >
                  {group?.members[0] || 'Unnamed'}
                </CustomText>
                :
                // <Text style={{ color: Color.whiteText, fontSize: 12, marginLeft: 10 }}>{group.members[0]?.username?.trim() || 'Unnamed'} </Text>
                <CustomText
                  size={12}
                  color={Color.whiteText}
                  style={{ marginLeft: 10 }}
                  font={font.PoppinsRegular}
                  numberOfLines={1}
                >
                  {group.members[0]?.username?.trim() || 'Unnamed'}
                </CustomText>
              }
              {group.members.length > 1 && (


                // <Text style={{ color: Color.whiteText, fontSize: 12, marginLeft: 2 }}>
                //   {`and ${group.members.length - 1} members`}
                // </Text>

                <CustomText
                  size={12}
                  color={Color.whiteText}
                  style={{ marginLeft: 10 }}
                  font={font.PoppinsRegular}
                  numberOfLines={1}
                >
                  {`and ${group.members.length - 1} members`}
                </CustomText>
              )
              }
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", justifyContent: "center", marginTop: 15, }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',

              backgroundColor: isFocused ? "" : 'transparent',
              borderRadius: isFocused ? 0 : 100,
              flex: 1,
            }}>
              <View style={styles.searchContainer} >
                <Image source={imageIndex.search} style={styles.searchImg} />
                <TextInput
                  allowFontScaling={false}
                  placeholder="Search movies, shows..."
                  placeholderTextColor={isFocused ? 'white' : 'white'}
                  style={styles.input}
                  onChangeText={handleCommentChange}
                  value={comment}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
                <TouchableOpacity onPress={() => {
                  setcomment('');
                  setSearchResult([]);
                }} >
                  <Image source={imageIndex.closeimg} style={styles.closingImg}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(true)}  >
              {totalFilterApply === 0 ? (
                <Image source={imageIndex.filterImg} style={{
                  height: 24,
                  width: 24,
                  resizeMode: "contain",
                  // right: 8
                }} />
              ) : (
                <Image source={imageIndex.filterImg} style={{
                  height: 24,
                  width: 24,
                  marginLeft: 8,
                  resizeMode: "contain",

                  tintColor: Color.primary
                }} />
              )}

            </TouchableOpacity>
            {totalFilterApply &&
              // <Text style={styles.totalFilterApply} >{totalFilterApply}</Text>
              <CustomText
                size={12}
                color={Color.whiteText}
                style={styles.totalFilterApply}
                font={font.PoppinsMedium}
                numberOfLines={1}
              >
                {totalFilterApply}
              </CustomText>
            }
          </View>


          {(searchResult.length === 0 && comment.trim() !== '' && isSearchLoading) ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {/* <Text style={{ color: 'white' }}>Searching...</Text> */}
              <CustomText
                size={14}
                color={Color.whiteText}
                style={{}}
                font={font.PoppinsMedium}
                numberOfLines={1}
              >
                Searching...
              </CustomText>
            </View>
          ) :


            (
              <Watchtogether
                loading={loading}
                token={token}
                groupId={groupId}
                groupMembers={group.members}
                groupRecommend={displayMovies}
                // groupRecommend={searchResult.length > 0 ? searchResult : groupRecommend}
                setActiveIndex={setActiveIndex}
                activeIndex={activeIndex}
              />
            )}
          {/* </View> */}

          {/* <SuccessMessageCustom
      first={false}
        titie={"Invite Sent!"}
        message="You’ve invited your friends to watch a movie together! Now, just wait for them to accept your invitation." />  */}

          {/* <View style={{
            marginBottom: 15
          }}>
            <FriendChat />
          </View> */}

          {groupMember &&
            <GroupMembersModal visible={groupMember}
              groupMembers={group.members}
              onClose={() => setGroupMember(false)}
              token={token}
              heading={"Group Members"} />
          }

          {groupSettingModal &&
            <GroupSettingModal
              visible={groupSettingModal}
              group={group}
              groupId={groupId}
              token={token}
              group_name={group_name}
              setGroup_name={setGroup_name}
              onClose={() => setGroupSettingModal(false)}


            />
          }

          {modalVisible &&
            <GroupMovieModal
              visible={modalVisible}
              group={group}
              groupId={groupId}
              token={token}
              // func={filterGroupMovie(selectedUsers, groupValue)}
              filterFunc={(selectedUsers, groupValue) => filterGroupMovie(token, groupId, selectedUsers, groupValue)}
              onClose={() => setModalVisible(false)}
              setTotalFilterApply={setTotalFilterApply}
              groupTotalMember={group.members.length}
            />
          }
          {/* <Notification
            visible={notificationModal}
            onClose={() => setNotificationModal(false)}
            bgColor={true}
          /> */}
          {/* <FriendthinkModal
            headaing={"Group Setting"}
            visible={thinkModal}
            onClose={() => setthinkModal(false)}
            reviews={movieReact}
            type="react"
          /> */}
          {/* <InviteModal
            onClose={() => setInviteModal(false)}
            visible={inviteModal} /> */}

          {/* {true && <SuccessMessageCustom
        first={false}
        titie={"Invite Sent!"}
        message="You’ve invited your friends to watch a movie together! Now, just wait for them to accept your invitation." />} */}
          {/* <Deatiesmodal visible={messModal} onClose={() => setMssModal(false)} /> */}
          {/* </ScrollView> */}
        </SafeAreaView>
      </ImageBackground>
      {/* </View> */}
    </KeyboardAvoidingView>