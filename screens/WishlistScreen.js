import React, {useEffect} from 'react';
import { View, ScrollView, Text } from 'react-native';
import {Button} from 'react-native-elements';
import {connect} from 'react-redux';
import BookCard from '../components/BookCard';

// récupère la liste d'envies depuis Redux chargé au moment du log-in


function WishlistScreen(props) {

  useEffect(() => {
    if (props.user===null) {
      props.navigation.navigate('Home')
    } 
  }, []);

  return (
    <ScrollView style={{ marginTop: 25, width:"100%"}} containerStyle={{flex:1}} >
      <Text style={{ textAlign: 'center',fontSize: 17, fontWeight:'600', marginTop:12, marginBottom:10}}>Ma Liste d'envies</Text>
          { props.wishlist.length > 0 
          ?
          props.wishlist.map((book,i) => (
                    <BookCard 
                    navigation={props.navigation}
                    bookId={book.bookId} 
                    bookTitle={book.title} 
                    bookCover={book.cover}
                    bookAuthors={book.authors}
                    bookDate={book.date}
                    bookPublisher={book.publisher}
                    bookPageCount={book.pageCount}
                    bookCategories={book.categories}
                    bookDescription={book.description}
                    key={i}
                    />
                ))
          : 
          <View>
            <Text style={{ textAlign: 'center',fontSize: 14, marginTop:20, marginBottom:10}}>Aucun livre dans votre Liste d'envies :(</Text>
            <Button  onPress={() => props.navigation.navigate('BottomNavigator', { screen: 'Recherche' })}   titleStyle={{color: "#23396C"}} buttonStyle={{backgroundColor: '#FCA311', margin:5, width:"90%", alignSelf:"center"}} title={"FAIRE UNE RECHERCHE"}/> 
          </View>
        }

      </ScrollView>    
  );
}


function mapStateToProps(state) {
  // console.log("state on WishlistScreen",state)
  return { user: state.user, wishlist:state.wishlist }
 }

 export default connect(
  mapStateToProps,
  null
)(WishlistScreen);