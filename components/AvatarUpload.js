import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import { View, Image, Platform, Text, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 


function AvatarUpload(props) {

  const [ imageUrl, setImageUrl ] = useState();
  const [ newimageUrl, setNewImageUrl ] = useState();
  const [ loading, setLoading ] = useState(false);


  // Permission Expo Image Picker
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  // Fonction pour choisir une image dans le téléphone
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
      exif:true,
      base64:true,
    });


    // envoi l'avatar sous formData dans le back via /upload
    if (!result.cancelled) {
      setLoading(true);
      let fileType = result.uri.substring(result.uri.lastIndexOf(".") + 1);
      var data = new FormData();
      data.append('avatar', {
        uri: result.uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`
      });
      const response = await fetch("https://nameless-woodland-78409.herokuapp.com/upload", {
        method: 'post',
        body: data
       })
      const dataResponse = await response.json();
      if (dataResponse.url) {
        setImageUrl(dataResponse.url); // à la création de compte
        setNewImageUrl(dataResponse.url); // à la modification
        props.onUploadAvatarClick(!newimageUrl ? dataResponse.url : newimageUrl); // envoi avatar dans store redux
        setLoading(false);
      } 
    }
  };

  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      {props.user // si on est dans modification de compte on prend l'image de Redux chargé depuis le login
      ?
      <View style={{flex:1, justifyContent:'center'}}>
          <Image source={{uri:!newimageUrl? props.user.avatar : newimageUrl}} alt="avatar" style={{ width: '100%', borderRadius:130/2, height:130, width:130, marginTop:30 }} />
          <Pressable style={{marginTop:-34}} onPress={pickImage}><MaterialCommunityIcons style={{alignSelf:"flex-end"}} name="image-edit" size={38} color="black" /></Pressable>
      </View>
      : 
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        {!imageUrl 
        ?
        <TouchableOpacity onPress={pickImage} style={{borderStyle:"dashed", backgroundColor:"#F5F5F5", borderColor:"#E5E5E5", borderWidth:2, borderRadius:"100%", height:130, width:130 ,flex:1, justifyContent:'center', alignItems:'center', marginTop:30}}>
          {loading 
          ? <ActivityIndicator color={'#23396C'} />
          :<Text style={{padding:10, textAlign:'center'}}><AntDesign name="plus" size={18} color="black" /> {'\n'} Choisir un avatar</Text>
          }
        </TouchableOpacity>
        :
        <View>
          {loading 
          ? 
          <TouchableOpacity  style={{borderStyle:"dashed", backgroundColor:"#F5F5F5", borderColor:"#E5E5E5", borderWidth:2, borderRadius:"100%", height:130, width:130 ,flex:1, justifyContent:'center', alignItems:'center', marginTop:30}}>
            <ActivityIndicator color={'#23396C'} /> 
          </TouchableOpacity>
          :
          <Image source={{uri: imageUrl}} alt="avatar" style={{ width: '100%', borderRadius:130/2, height:130, width:130, marginTop:30 }} />}
          <Pressable style={{marginTop:-34}} onPress={pickImage}><MaterialCommunityIcons style={{alignSelf:"flex-end"}} name="image-edit" size={38} color="black" /></Pressable>
        </View>
        }
      </View>
      }
    </View>
  );
};

function mapDispatchToProps(dispatch) {
  return {
    onUploadAvatarClick: function(avatar) {
        dispatch( {type: 'saveAvatar', avatar} )
    } 
  }
};

function mapStateToProps(state) {
  // console.log("state on AvatarUpload",state)
  return { avatar:state.avatar, user:state.user }
 }

export default connect(mapStateToProps, mapDispatchToProps)(AvatarUpload);
