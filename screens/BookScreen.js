import React, {useState, useEffect} from 'react';
import { View, ScrollView, Text, StyleSheet, Image, FlatList, TouchableOpacity, Alert } from 'react-native';
import {Badge, Button} from 'react-native-elements';
import {connect} from 'react-redux';
import IconIonicons from 'react-native-vector-icons/Ionicons';
var striptags = require('striptags'); 
import ReadMore from 'react-native-read-more-text';


function BookScreen(props) {

  const [boutonWLStyle, setBoutonWLStyle]= useState(false);
  const [boutonLBStyle, setBoutonLBStyle]= useState(false);
  const [loadingWLDelete, setLoadingWLDelete]= useState(false);
  const [loadingWLAdd, setLoadingWLAdd]= useState(false);
  const [loadingLBDelete, setLoadingLBDelete]= useState(false);
  const [loadingLBAdd, setLoadingLBAdd]= useState(false);
  const [associated, setAssociated]= useState([]);
  const { bookCover, bookTitle, bookDescription, bookPublisher, bookDate, bookCategories, bookAuthors, bookId, bookPageCount } = props.route.params;
  // console.log("route.params",props.route.params)


  // pour traduire et formatter les catégories de l'api google
  var translateCat = {
    "Antiques & Collectibles":"Antiques et à Collectionner",
    "Architecture":"Architecture",
    "Art":"Art",
    "Bibles":"Bibles",
    "Biography & Autobiography":"Biographies",
    "Body, Mind & Spirit":"Corps et Esprit",
    "Business & Economics":"Entreprises et Économie",
    "Comics & Graphic Novels":"Bandes Dessinées",
    "Computers":"Informatique",
    "Cooking":"Cuisine",
    "Crafts & Hobbies":"Artisanat et Hobbies",
    "Design":"Désign",
    "Drama":"Art Dramatique",
    "Education":"Éducation",
    "Family & Relationships":"Famille",
    "Fiction":"Romans",
    "Foreign Language Study":"Langues étrangères",
    "Games & Activities":"Jeux",
    "Gardening":"Jardinage",
    "Health & Fitness":"Santé",
    "History":"Histoire",
    "House & Home":"Maison",
    "Humor":"Humour",
    "Juvenile Fiction":"Livre pour enfant",
    "Juvenile Nonfiction":"Livre pour enfant",
    "Language Arts & Disciplines":"Langages",
    "Law":"Loi",
    "Literary Collections":"Romans",
    "Literary Criticism":"Critiques Litéraires",
    "Mathematics":"Mathématiques",
    "Medical":"Médecine",
    "Music":"Musique",
    "Nature":"Nature",
    "Performing Arts":"Arts de la Scène",
    "Pets":"Animaux de Compagnie",
    "Philosophy":"Philosophie",
    "Photography":"Photographie",
    "Poetry":"Poésie",
    "Political Science":"Science Politique",
    "Psychology":"Psychologie",
    "Reference":"Référence",
    "Religion":"Religion",
    "Science":"Science",
    "Self-Help":"Développement Personnel",
    "Social Science":"Sciences Sociales",
    "Sports & Recreation":"Sports et Loisirs",
    "Study Aids":"Etudes",
    "Technology & Engineering":"Technologie",
    "Transportation":"Transport",
    "Travel":"Voyages",
    "True Crime":"Criminalité",
    "Young Adult Fiction":"Adolescent",
    "Young Adult Nonfiction":"Adolescent",
    }

  var styleBook;
  if (bookCover && bookCategories !== "Unavailable") {
      styleBook=bookCategories[0].split('/')[0].trim();
      styleBook=translateCat[styleBook];
  }


  // pour gérer le cas pas d'image de livre dans l'api
  var imageApi;
  if (bookCover && bookCover !== "Unavailable"){
      imageApi = bookCover;
  }
  var Unavailable = require('../assets/cover_nondispo.jpg');
  

  // pour couper le titre du livre
  function titleCut (desc) {
    if (desc.length > 55){
        return desc.substring(0,51)+"..."
      } else {
          return desc
      };
};

// pour formatter la liste d'auteurs
var authors;
if (bookAuthors && bookAuthors !== "Unavailable"){
    if (bookAuthors.length>1){
    authors=bookAuthors.join(', ');
    } else {
    authors=bookAuthors;
    };
};

  // pour formatter la date
  var date;
  if (bookDate) {
  date = new Date (bookDate);
  date = date.getFullYear()
  }


  // pour formatter le view more / less en cas de description trop longue
  _renderTruncatedFooter = (handlePress) => {
    return (
      <Text style={{color: "#23396C", marginTop: 0, fontWeight:"bold"}} onPress={handlePress}>
        Voir plus
      </Text>
    );
  }
 
  _renderRevealedFooter = (handlePress) => {
    return (
      <Text style={{color: "#23396C",marginTop: 0, fontWeight:"bold"}} onPress={handlePress}>
        Voir moins
      </Text>
    );
  }

  // pour récupérer les suggestions de livres associées
  useEffect(() => {
    if (props.user!==null) {
      const findBook = async() => {
        const assoc = await fetch(`https://books.googleapis.com/books/v1/volumes/${bookId}/associated`);
        const assocjson = await assoc.json();
          if (assocjson.items) {
          setAssociated(assocjson.items.slice(0,10));
          } else {
            setAssociated([]);
          }
      }
      findBook()  
    } else {
      props.navigation.navigate('Home')
    }
  },[])

    // pour afficher les livres associés
    var renderItemComponent = (itemData) => 
    <TouchableOpacity           onPress={() => {props.navigation.push('Book', {
      bookTitle: itemData.volumeInfo.title, 
      bookId: itemData.id, 
      bookAuthors:!itemData.volumeInfo.authors ? "Unavailable" :itemData.volumeInfo.authors,
      bookPublisher:!itemData.volumeInfo.publisher ? "Unavailable" :itemData.volumeInfo.publisher,
      bookDate:!itemData.volumeInfo.publishedDate ? "Unavailable" :itemData.volumeInfo.publishedDate,
      bookPageCount:!itemData.volumeInfo.pageCount ? "Unavailable" : itemData.volumeInfo.pageCount,
      bookCategories:!itemData.volumeInfo.categories ? "Unavailable" : itemData.volumeInfo.categories,
      bookDescription:!itemData.volumeInfo.description ? "Unavailable" :itemData.volumeInfo.description,
      bookCover: !itemData.volumeInfo.imageLinks ? "Unavailable" : itemData.volumeInfo.imageLinks.thumbnail,
    })}}>  
        <Image style={styles.image} source={!itemData.volumeInfo.imageLinks || itemData.volumeInfo.imageLinks === undefined ? Unavailable : { uri: itemData.volumeInfo.imageLinks.thumbnail }} /> 
    </TouchableOpacity>


    // ajout à la wishlist
    const handleClickWLAdd = async () => {
      if (props.user!==null) {
        setLoadingWLAdd(true)
        var addWishList = async () => {
          const data = await fetch(`https://bookin-mobile-backend.herokuapp.com/wishlist/add/${props.user.token}/${bookId}`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({"cover":bookCover, "title":bookTitle, "description":bookDescription, "publisher":bookPublisher, "date":bookDate,"categories":bookCategories, "authors":bookAuthors, "pageCount":bookPageCount})
          });
          const body = await data.json();
          setLoadingWLAdd(false)
          // console.log("body Add Wishlist",body)
          if (body.result===true) {
            setBoutonWLStyle(!boutonWLStyle);
            props.addToWishList({"cover":bookCover, "title":bookTitle, "description":bookDescription, "publisher":bookPublisher, "date":bookDate,"categories":bookCategories, "authors":bookAuthors, "pageCount":bookPageCount,"bookId":bookId});
          }
    
        };
        addWishList();
        
      } else {
        Alert.alert(`Vous devez être connecté`)
      }
    };
  
  
    // suppression de la wishlist
    const handleClickWLDelete = async () => {
      if (props.user!==null) {
        setLoadingWLDelete(true)
        const dataDelete = await fetch(`https://bookin-mobile-backend.herokuapp.com/wishlist/delete/${props.user.token}/${bookId}`, {
        method: 'DELETE'
        });
        const bodyDelete = await dataDelete.json();
        // console.log("body Delete Wishlist",bodyDelete)
        setLoadingWLDelete(false)
          if (bodyDelete.result===true) {
          setBoutonWLStyle(false);
          var index;
          for (let i = 0; i < props.wishlist.length; i++) {
            if (props.wishlist[i].bookId === bookId) {
              index = i;
            }
          }
          props.DeleteToWishList(bookId, index);
        }
        
      }
    };

  // Ajouter à la biblitohèque
  const handleClicLBAdd = async () => {
    if (props.user!==null) {
      setLoadingLBAdd(true)
      var addLibrary= async () => {
        const data = await fetch(`https://bookin-mobile-backend.herokuapp.com/library/add/${props.user.token}/${bookId}`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({"cover":bookCover, "title":bookTitle, "description":bookDescription, "publisher":bookPublisher, "date":bookDate,"categories":bookCategories, "authors":bookAuthors, "pageCount":bookPageCount})
        });
        const body = await data.json();
        setLoadingLBAdd(false);
        // console.log("body Add library",body)
        if (body.result===true) {
          setBoutonLBStyle(!boutonLBStyle);
          props.addToLibrary({"cover":bookCover, "title":bookTitle, "description":bookDescription, "publisher":bookPublisher, "date":bookDate,"categories":bookCategories, "authors":bookAuthors, "pageCount":bookPageCount, "bookId":bookId});
        }
      };
      addLibrary();
    } else {
      Alert.alert(`Vous devez être connecté`)
    }
  };

  // Supprimer de la biblitohèque
  const handleClickLBDelete = async () => {
    if (props.user!==null) {
      setLoadingLBDelete(true)
      const dataDelete = await fetch(`https://bookin-mobile-backend.herokuapp.com/library/delete/${props.user.token}/${bookId}`, {
      method: 'DELETE'
      });
      const bodyDelete = await dataDelete.json();
      setLoadingLBDelete(false)
      if (bodyDelete.result===true) {
        var index;
        for (let i = 0; i < props.library.length; i++) {
          if (props.library[i].bookId === bookId) {
            index = i;
          }
        }
        props.DeleteToLibrary(bookId, index);
        setBoutonLBStyle(!boutonLBStyle);
      }
      
    }
  };

  // Boutons pour ajout à la WishList
  var boutonWishListSelected = (
    <Button loading={loadingWLDelete}loadingProps={{color:"#23396C"}} loadingStyle={{paddingLeft:40, paddingRight:40}} onPress={() => handleClickWLDelete()} icon={<IconIonicons name="heart" size={22} color="#23396C"/>} titleStyle={{color: "#23396C"}} buttonStyle={styles.button} title={"AJOUTÉ  "}/> 
  );

  var boutonWishListDefault = (
  <Button loading={loadingWLAdd}loadingProps={{color:"#23396C"}} loadingStyle={{paddingLeft:60, paddingRight:60}} onPress={() => handleClickWLAdd()} icon={<IconIonicons name="heart-outline" size={22} color="#23396C"/>} titleStyle={{color: "#23396C"}} buttonStyle={styles.button} title={"JE VEUX LIRE  "}/> 
  );

  // Boutons pour ajout à la Bibliothèque 
  var boutonLibrarySelected = (
    <Button loading={loadingLBDelete}loadingProps={{color:"#23396C"}} loadingStyle={{paddingLeft:40, paddingRight:40}} onPress={() => handleClickLBDelete()}  icon={<IconIonicons name="library" size={22} color="#23396C"/>}  titleStyle={{color: "#23396C"}} buttonStyle={styles.button} title={"AJOUTÉ  "}/> 
  );

  var boutonLibraryDefault = (
    <Button loading={loadingLBAdd}loadingProps={{color:"#23396C"}} loadingStyle={{paddingLeft:25, paddingRight:25}} onPress={() => handleClicLBAdd()}  icon={<IconIonicons name="library-outline" size={22} color="#23396C"/>}  titleStyle={{color: "#23396C"}} buttonStyle={styles.button} title={"J'AI LU  "}/> 
  );

  useEffect(() => {
    if (props.user!==null) {
      for (let i = 0; i < props.wishlist.length; i++) {
        if (props.wishlist[i].bookId === bookId) {
          setBoutonWLStyle(true);
        }
      };
      for (let i = 0; i < props.library.length; i++) {
        if (props.library[i].bookId === bookId) {
          setBoutonLBStyle(true);
        }
      };
    };
  },[bookId])



  

  return (
    <ScrollView style={{width:"100%"}} containerStyle={{flex:1}} >
      <View style={{flex:1, flexDirection:"row", backgroundColor:"#23396C", padding:20, paddingBottom:50}}>
          <Image  style={styles.image} source={bookCover === "Unavailable" ? Unavailable : { uri:imageApi}} alt={props.bookTitle} />
          <View style={{flex:1, flexDirection:"column", alignItems:'baseline'}}>
            <Text  style={{color:"white", fontSize:18, marginBottom:10, textAlign:'left'}} >{titleCut(bookTitle)} </Text>
            <Text style={{color:"white", fontSize:12, marginBottom:10}}>{bookDate !== "Unavailable" && bookDate && `${date} `}{bookPublisher!== "Unavailable" && `- ${bookPublisher}`}{bookPageCount !== "Unavailable" && ` - ${bookPageCount} pages`}  </Text>
            <Text style={{color:"white", fontSize:14, marginBottom:10}}>{authors} </Text>
            {bookCategories[0] !== "Unavailable" && bookCategories !== "Unavailable" && styleBook !== undefined && <Badge value={styleBook} badgeStyle={{backgroundColor:'#FCA311'}} textStyle={{color:'#23396C'}}></Badge>}
          </View>
      </View>
      <View style={{flex:1, flexDirection:"row", justifyContent:'space-around', padding:15, marginTop:-40}}>
      {boutonLBStyle ? boutonLibrarySelected : boutonLibraryDefault}
      {boutonWLStyle ? boutonWishListSelected : boutonWishListDefault}
      </View>
      {bookDescription !== "Unavailable" &&
      <View style={{flex:1, flexDirection:"column", justifyContent:'flex-start', padding:15, paddingTop:0}}>
        <Text  style={{color:"#23396C", fontSize:24, marginBottom:10, textAlign:'left'}} >Résumé</Text>
        <ReadMore
              numberOfLines={10}
              renderTruncatedFooter={(e) => _renderTruncatedFooter(e)}
              renderRevealedFooter={(e) =>_renderRevealedFooter(e)}
        >
          <Text  style={{color:"#23396C",  marginBottom:10, textAlign:'left'}} >"{striptags(bookDescription)}"</Text>
        </ReadMore>
      </View>}
      {associated.length > 1 &&
      <View style={{flex:1, flexDirection:"column", justifyContent:'flex-start', padding:15, paddingTop:0}}>
        <Text  style={{color:"#23396C", fontSize:24, marginBottom:10, textAlign:'left'}} >Si vous avez aimé</Text>
        <FlatList
        data={associated}
        renderItem={({item}) => renderItemComponent(item)}
        horizontal
        keyExtractor={item => item.id.toString()}
       />
      </View>
      }
    </ScrollView>   
  );
}

const styles = StyleSheet.create({
  image: {
    width: 104,
    height: 168,
    marginRight:20,
  },
  button: {
    backgroundColor: '#FCA311',
    margin:5
  }
});

function mapDispatchToProps(dispatch) {
  return {
    addToWishList: function(bookInfo) {
        dispatch( {type: 'addToWishList', bookInfo:bookInfo} )
    }, 
    DeleteToWishList: function(bookId, index) {
      dispatch( {type: 'DeleteToWishList', bookId:bookId, index:index} )
    },
    addToLibrary: function(bookInfo) {
      dispatch( {type: 'addToLibrary', bookInfo:bookInfo} )
    }, 
    DeleteToLibrary: function(bookId, index) {
    dispatch( {type: 'DeleteToLibrary', bookId:bookId, index:index} )
    },
  }
}

function mapStateToProps(state) {
  // console.log("state oon BookScreen",state)
  return { user: state.user, wishlist: state.wishlist, library:state.library }
 }

 export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BookScreen);