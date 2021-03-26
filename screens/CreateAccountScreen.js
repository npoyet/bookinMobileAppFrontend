import React, {useState, useRef} from 'react';
import { View, ScrollView, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import {Button} from 'react-native-elements'
import {connect} from 'react-redux';
import AvatarUpload from '../components/AvatarUpload';


function CreateAccountScreen(props) {

  const ref_input2 = useRef();
  const ref_input3 = useRef();
  const [userLibraryName, setUserLibraryName]= useState('');
  const [userEmail, setUserEmail]= useState('');
  const [userPassword, setUserPassword]= useState('');
  const [ userMessage, setUserMessage ] = useState('');

// pour checker le format de l'email
  const checkEmailFormat = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email ? re.test(String(email).toLowerCase()) : false;
  }

// pour créer le compte en BDD
  const createUserAccount = async () => {
  if (!checkEmailFormat(userEmail)) {
      setUserMessage('veuillez saisir un email valide.');
  } else {
    const response = await fetch('https://bookin-mobile-backend.herokuapp.com/sign-up', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: `avatar=${props.avatar}&name=${userLibraryName}&email=${userEmail.toLowerCase()}&password=${userPassword}`
    });
    const dataResponse = await response.json();
    if (dataResponse.userToken) {
      props.onCreateAccountClick({token: dataResponse.userToken, avatar: dataResponse.userAvatar});
      props.navigation.navigate('BottomNavigator', { screen: 'Recherche' })
    }
    if (dataResponse.result === false) {
      setUserMessage(dataResponse.message);
    }
    }
  }

  return (
    <ScrollView style={{width:"100%", backgroundColor:"white"}} containerStyle={{flex:1}} keyboardShouldPersistTaps="handled" >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : "height"} style={{ flex: 1 }}>
        <View style={{flex:1, justifyContent:"center", alignItems:'center'}}> 
        <AvatarUpload />
        <TextInput
                  style = {{width: '90%', height: 50, borderBottomWidth:1, borderColor: "#23396C", margin:12, fontSize:18}}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder='Email'
                  returnKeyType="next"
                  autoCapitalize="none"
                  onChangeText={(value)=>setUserEmail(value)}
                  value={userEmail}
                  blurOnSubmit={false}
                  onSubmitEditing={() => ref_input2.current.focus()}
            />
            <TextInput
                style = {{width: '90%', height: 50, borderBottomWidth:1, borderColor: "#23396C", margin:12, fontSize:18}}
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
            <TextInput
                style = {{width: '90%', height: 50, borderBottomWidth:1, borderColor: "#23396C", margin:12, fontSize:18, marginBottom:30}}
                textContentType="nickname"
                placeholder='Pseudo'
                returnKeyType="send"
                autoCapitalize="none"
                onChangeText={(value)=> setUserLibraryName(value)}
                value={userLibraryName}
                ref={ref_input3}
                onSubmitEditing={() => createUserAccount()}
            />
            {userMessage !=='' && <Text style={{textAlign:'center', width:'90%', color:'red', marginBottom:5 }}>{userMessage}</Text>}
            <Button
                title="S'INSCRIRE"
                type="solid"
                containerStyle={{width:'90%'}}
                buttonStyle={{backgroundColor:"#FCA311"}}
                titleStyle={{color: "#23396C"}}
                onPress={() => createUserAccount()}
            />
            <Text style={{textAlign:'left', width:'90%',marginTop: 20, fontSize:12 }}>
            En vous inscrivant sur book_in, vous acceptez nos Conditions Générales d'Utilisation et notre politique de protection de données personnelles.
            </Text>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>    
  );
}



function mapDispatchToProps(dispatch) {
  return {
    onCreateAccountClick: function(user) {
        dispatch( {type: 'saveUser', user} )
    } 
  }
}
function mapStateToProps(state) {
  // console.log("state on CreateAccount Screen", state)
  return { user: state.user, avatar: state.avatar}
}
export default connect(mapStateToProps, mapDispatchToProps)(CreateAccountScreen);