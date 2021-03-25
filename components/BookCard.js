import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// pour afficher une liste de livre

function BookCard(props) {


    // pour couper le titre du livre
    function titleCut (desc) {
        if (desc.length > 55){
            return desc.substring(0,51)+"..."
          } else {
              return desc
          };
    };

    // pour séparer si plusieurs auteurs
    var authors;
    if (props.bookAuthors){
        if (props.bookAuthors.length>1){
        authors=props.bookAuthors.join(', ');
        } else {
        authors=props.bookAuthors;
        };
    };

    // pour formatter la date de publication
    var date;
    if (props.bookDate) {
    date = new Date (props.bookDate);
    date = date.getFullYear()
    }

    // pour gérer si le livre n'a pas de cover
    var imageApi;
    if (props.bookCover || props.bookCover !== "Unavailable"){
        imageApi = props.bookCover;
    }
    if (props.bookCover === "Unavailable") {
        var Unavailable = require('../assets/cover_nondispo.jpg');
    }



    return (
 
            <TouchableOpacity onPress={() => {props.navigation.navigate('Book', {
                bookTitle: props.bookTitle, 
                bookId: props.bookId,
                bookAuthors: props.bookAuthors,
                bookDate:props.bookDate,
                bookCover:props.bookCover,
                bookPublisher:props.bookPublisher,
                bookPageCount:props.bookPageCount,
                bookDescription:props.bookDescription,
                bookCategories:props.bookCategories,
                })}}>
                    <View  style={{flex:1, flexDirection:'row', margin:15}} >
                        <Image  style={styles.image} source={props.bookCover === "Unavailable" ? Unavailable : { uri:imageApi}} alt={props.bookTitle} />
                        <View style={{flex:1, flexDirection:'column'}}>
                            <Text  style={{color:"#333", fontSize:18, marginBottom:10}}>{titleCut(props.bookTitle)} </Text>
                            <Text style={{color:"#333", fontSize:12, marginBottom:10}}>{date} </Text>
                            <Text style={{color:"#333", fontSize:14, marginBottom:10}}>{authors} </Text>
                        </View>
                    </View>
            </TouchableOpacity>        

    );
}

const styles = StyleSheet.create({
    image: {
      width: 130,
      height: 210,
      marginRight:10,
    },
  });
  

export default BookCard;
