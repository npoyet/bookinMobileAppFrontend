import React, {useState, useEffect, useRef} from 'react';
import { View, ScrollView, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import {Button} from 'react-native-elements'
import {connect} from 'react-redux';
import AvatarUpload from '../components/AvatarUpload';


function AccountScreen(props) {

  const ref_input2 = useRef();
  const ref_input3 = useRef();
  const [userLibraryName, setUserLibraryName]= useState('');
  const [userEmail]= useState('');
  const [userPassword, setUserPassword]= useState('');
  const [userMessage, setUserMessage ] = useState('');
  const [currentEmail, setCurrentEmail ] = useState('');
  const [currentPseudo, setCurrentPseudo ] = useState('');
  const [currentPassword, setCurrentPassword ] = useState('');


  // fonction log-out
  const logOut = () => {
    props.setLibrary([]);
    props.setWishlist([]);
    props.onLogoutClick(props.user);
    props.navigation.navigate('Home')
  }

 // fonction qui modifie en une fois le pseudo, l'avatar et le mot de passe (doit retaper l'ancien)
  const modifyAccount = async () => {
    const response = await fetch(`https://nameless-woodland-78409.herokuapp.com/users/update/${props.user.token}`, {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: `avatar=${props.avatar}&name=${userLibraryName}&currentPassword=${currentPassword}&password=${userPassword}`
    });
    const dataResponse = await response.json();
    if (dataResponse.userToken) {
      props.onCreateAccountClick({token: dataResponse.userToken, avatar: dataResponse.userAvatar});
      setUserLibraryName('');
      setCurrentPassword('');
      setUserPassword('');
      Alert.alert(`Modification du profil réalisée avec succès`)
    }
    if (dataResponse.result === false) {
      setUserMessage(dataResponse.message);
    }
  }

  // pour récupérer l'email et le pseudo existant à l'arrivée
  useEffect(() => {
    if (props.user!==null) {
      var getUserInfo = async () => {
        const data = await fetch(`https://nameless-woodland-78409.herokuapp.com/users/${props.user.token}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded' },
          body: `token=${props.user.token}`
        });
        const body = await data.json();
        if (body.result===true) {
          setCurrentEmail(body.userEmail);
          setCurrentPseudo(body.userLibraryName);
        }
      };
      getUserInfo();
    } else {
      props.navigation.navigate('Home')
    }
  
  },[])

  return (
    <ScrollView style={{width:"100%"}} containerStyle={{flex:1}} keyboardShouldPersistTaps="handled" >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={{flex:1, justifyContent:"center", alignItems:'center'}}> 
          <AvatarUpload />
          <Text
            style = {{width: '90%',color:"#23396C", margin:12, marginBottom:0, marginTop:20, fontSize:24, fontWeight:"bold"}}
          >
            Email
          </Text>
          <Text
            style = {{width: '90%', margin:12, marginBottom:0, marginTop:10, fontSize:16, fontStyle:"italic"}}
          >
            Votre Email (non modifiable):
          </Text>
          <TextInput
                  style = {{width: '90%', height: 50, borderBottomWidth:1, borderColor: "#23396C", margin:12, marginTop:0, fontSize:18, color:"grey"}}
                  placeholder='Email'
                  value={currentEmail}
                  editable={false}
          />
          <Text
            style = {{width: '90%', color:"#23396C", margin:12, marginBottom:0, marginTop:20, fontSize:24, fontWeight:"bold"}}
          >
            Mot de passe
          </Text>
          <Text
            style = {{width: '90%', margin:12, marginBottom:0, marginTop:10, fontSize:16, fontStyle:"italic"}}
          >
            Insérer votre ancien mot de passe:
          </Text>
          <TextInput
                style = {{width: '90%', height: 50, borderBottomWidth:1, borderColor: "#23396C", margin:12, marginTop:0, fontSize:18}}
                secureTextEntry
                textContentType="password"
                placeholder='Mot de passe'
                autoCapitalize="none"
                returnKeyType="next"
                onChangeText={(value)=> setCurrentPassword(value)}
                value={currentPassword}
                blurOnSubmit={false}
                onSubmitEditing={() => ref_input2.current.focus()}
            />
            <Text
              style = {{width: '90%', margin:12, marginBottom:0, marginTop:10, fontSize:16, fontStyle:"italic"}}
            >
            Insérer votre nouveau mot de passe:
            </Text>
            <TextInput
                style = {{width: '90%', height: 50, borderBottomWidth:1, borderColor: "#23396C", margin:12, marginTop:0, fontSize:18}}
                secureTextEntry
                textContentType="password"
                placeholder='Mot de passe'
                autoCapitalize="none"
                returnKeyType="next"
                onChangeText={(value)=> setUserPassword(value)}
                value={userPassword}
                ref={ref_input2}
                blurOnSubmit={false}
                onSubmitEditing={() => ref_input3.current.focus()}
            />
          <Text
            style = {{width: '90%', color:"#23396C", margin:12, marginBottom:0, marginTop:20, fontSize:24, fontWeight:"bold"}}
          >
            Pseudo
          </Text>
          <Text
            style = {{width: '90%', margin:12, marginBottom:0, marginTop:10, fontSize:16, fontStyle:"italic"}}
          >
            Votre Pseudo:
          </Text>
          <TextInput
                  style = {{width: '90%', height: 50, borderBottomWidth:1, borderColor: "#23396C", margin:12, marginTop:0, fontSize:18, color:"grey"}}
                  placeholder='Pseudo'
                  value={currentPseudo}
                  editable={false}
          />
          <Text
              style = {{width: '90%', margin:12, marginBottom:0, marginTop:10, fontSize:16, fontStyle:"italic"}}
            >
            Insérer votre nouveau Pseudo:
          </Text>
          <TextInput
                style = {{width: '90%', height: 50, borderBottomWidth:1, borderColor: "#23396C", margin:12, fontSize:18, marginTop:0, marginBottom:30}}
                textContentType="nickname"
                placeholder='Pseudo'
                returnKeyType="send"
                autoCapitalize="none"
                onChangeText={(value)=> setUserLibraryName(value)}
                value={userLibraryName}
                ref={ref_input3}
                onSubmitEditing={() => modifyAccount()}
            />
          {userMessage !=='' && <Text style={{textAlign:'center', width:'90%', color:'red', marginBottom:5 }}>{userMessage}</Text>}
          <Button
              title="MODIFIER MON PROFIL"
              type="solid"
              containerStyle={{width:'90%'}}
              buttonStyle={{backgroundColor:"#FCA311", marginBottom:40}}
              titleStyle={{color: "#23396C"}}
              onPress={() => modifyAccount()}
          />
          <Button
              title="ME DECONNECTER"
              titleStyle={{color: "#FCA311"}}
              type="solid"
              containerStyle={{width:'90%', marginBottom:20}}
              buttonStyle={{backgroundColor:"#23396C"}}
              onPress={() => logOut()}
          />

        </View>
      </KeyboardAvoidingView>
    </ScrollView>    
  );
}


function mapDispatchToProps(dispatch) {
  return {
    onCreateAccountClick: function(user) {
      dispatch( {type: 'saveUser', user} )
    }, 
    onLogoutClick: function(user) {
      dispatch( {type:'deleteUser', user} )
    },
    setWishlist: function(wishlist) {
      dispatch( {type: 'setWishlist', wishlist:wishlist} )
    }, 
    setLibrary: function(library) {
      dispatch( {type: 'setLibrary', library:library} )
    }, 
  }
}
function mapStateToProps(state) {
  // console.log("state on AccountScreen", state)
  return { user: state.user, avatar: state.avatar}
}
export default connect(mapStateToProps, mapDispatchToProps)(AccountScreen);