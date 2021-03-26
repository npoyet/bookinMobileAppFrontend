import React, {useState, useRef} from 'react';
import { StyleSheet, Image, ScrollView, View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import {Button} from 'react-native-elements'
import {connect} from 'react-redux';


function HomeScreen(props) {
  const ref_input2 = useRef();
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ userMessage, setUserMessage ] = useState('');

  // pour checker le format de l'email
  const checkEmailFormat = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email ? re.test(String(email).toLowerCase()) : false;
  }

  // pour gérer la connexion utilisateur
  const checkPasswordToLogin = async () => {
    if (!checkEmailFormat(email)) {
        setUserMessage('Veuillez saisir un email valide.'); 
    } else {
    setUserMessage('')
    const response = await fetch('https://bookin-mobile-backend.herokuapp.com/log-in', {
        method: 'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: `email=${email.toLowerCase()}&password=${password}`
    });
    const dataResponse = await response.json(); // {login: true, userToken: "N9mwAoACDrKevTGj7aV8zZqKbLhRC2Qs"}
    if (dataResponse.login) {
        props.onCheckAccountClick({token : dataResponse.userToken, avatar: dataResponse.userAvatar});
        // var wishlistMap = dataResponse.userWishlist.map((e) => e.bookId);
        // var libraryMap = dataResponse.userLibrary.map((e) => e.bookId);
        props.setWishlist(dataResponse.userWishlist);
        props.setLibrary(dataResponse.userLibrary);
        props.navigation.navigate('BottomNavigator', { screen: 'Recherche' })
    } else {
        setUserMessage(dataResponse.message);
    }
    }       
  }

    return (
      <ScrollView style={{width:'100%'}}  containerStyle={{flex:1}} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "position" : "height"} style={{ flex: 1 }}>

        <View style={{flex:1, flexDirection:"column", alignItems:'center', marginTop:80}}>
          <Image source={require('../assets/bookin-logo.png')} style={styles.image}/>
          <TextInput
                style = {{width: '90%', height: 50, borderBottomWidth:1, borderColor: "#23396C", margin:12, fontSize:18}}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCapitalize="none"
                placeholder='Email'
                returnKeyType="next"
                onChangeText={(value)=>setEmail(value)}
                value={email}
                blurOnSubmit={false}
                onSubmitEditing={() => ref_input2.current.focus()}
          />
          <TextInput
              style = {{width: '90%', height: 50, borderBottomWidth:1, borderColor: "#23396C", margin:12, fontSize:18}}
              secureTextEntry
              textContentType="password"
              placeholder='Mot de passe'
              autoCapitalize="none"
              returnKeyType="send"
              onChangeText={(value)=> setPassword(value)}
              value={password}
              ref={ref_input2}
              onSubmitEditing={() => checkPasswordToLogin()}

          />
          <Text style={{textAlign:'right', width:'90%', fontStyle:'italic',marginBottom: 20, marginTop:0, fontSize:12 }}>Mot de passe oublié ?</Text>
          {userMessage !=='' && <Text style={{textAlign:'center', width:'90%', color:'red', marginBottom:5 }}>{userMessage}</Text>}
          <Button
              title="SE CONNECTER"
              type="solid"
              containerStyle={{width:'90%'}}
              buttonStyle={{backgroundColor:"#FCA311"}}
              titleStyle={{color: "#23396C"}}
              onPress={() => checkPasswordToLogin()}
          />

          <Text style={{textAlign:'center', width:'90%',marginTop: 40 }}>Pas encore inscrit ? 
            <Text style={{fontWeight:'bold'}} onPress={() => props.navigation.navigate("Inscription")} > Créer un compte ici &gt;</Text>
          
          </Text>
        </View>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }


const styles = StyleSheet.create({
  image: {
    height:90,
    width:324,
    marginBottom:0,
  },
});


function mapDispatchToProps(dispatch) {
  return {
    onCheckAccountClick: function(user) {
        dispatch( {type: 'saveUser', user} )
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
  // console.log("state on HomeScreen", state)
  return { user: state.user }
}
export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);