import React, { useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, Alert, Vibration } from 'react-native';
import {Button, Overlay, SearchBar} from 'react-native-elements';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import Toggle from 'react-native-toggle-element';
import { useIsFocused } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import BookCard from '../components/BookCard';
import {connect} from 'react-redux';
import { BOOKS_API_KEY } from '@env'


function SearchScreen(props) {

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [type, setType] = useState(BarCodeScanner.Constants.Type.back);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false); 
  const [bookScanned, setBookScanned] = useState(null);
  const isFocused = useIsFocused();
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(["start"]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isFetching, setIsFetching] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const toggleSwitch = () => setIsEnabled(!isEnabled);

  // recherche via Google Books API
  var handleSearch = async (q) => {
    try {
        const data = await fetch(`https://books.googleapis.com/books/v1/volumes?q=${q}&fields=items(id,volumeInfo/title,volumeInfo/imageLinks,volumeInfo/authors,volumeInfo/publishedDate,volumeInfo/pageCount,volumeInfo/description,volumeInfo/publisher,volumeInfo/categories),totalItems&maxResults=20&langRestrict=fr&orderBy=relevance&apiKey=${BOOKS_API_KEY}`)
        const body = await data.json();
        const books = await body.items;
        setVisible(false);
        if (books) {
          if (isEnabled) {
            Vibration.vibrate();
            setBookScanned(books[0]);
          } else {
            setResult(books);
          }
        } else {
          if (isEnabled) {
            Alert.alert(`Aucun livre ne correspond ! Veuillez réessayer`);
            setBookScanned(null)
          }

        setResult([]);
        };
    }
    catch(error) {
        setError(true);
        console.log("error",error)
    }
  };
 

  // recherche texte
  const searchFunction = (query) => {
    if (query !== '' && query.length > 3) {
      setSearch(query);
      setIsFetching(true);
      handleSearch(query);
      setIsFetching(false);
      setHasSearched(true);
    } else {
      setSearch(query);
    }
  };

// recherche via Expo Barcode Scanner
  useEffect(() => {
    if (props.user!==null) {
    (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
    })();
    } else {
      props.navigation.navigate('Home')
    }
  }, []);
 
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setVisible(true);
    handleSearch(data)
  };

  if (hasPermission === null) {
    return <Text>Veuillez autoriser l'appareil photo pour scanner</Text>;
  }
  if (hasPermission === false) {
    return <Text>Vous n'avez pas autorisé l'appareil photo pour scanner</Text>;
  }


  var barCodeDisplay;
  if(hasPermission && isFocused && isEnabled) {
    barCodeDisplay = 
    <View style={{flex:1}}>
      <Overlay isVisible={visible}>
        <Text>Recherche des informations concernant le livre...</Text>
      </Overlay>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        type={type}
        style={styles.container}
      >
        <Text style={styles.description}>Placer le code-barre du livre dans le cadre ci-dessous</Text>
        <Image
          style={styles.qr}
          source={require('../assets/scan.png')}
        />
        <TouchableOpacity 
          style={{alignSelf:'flex-end', alignItems:"center", marginBottom:15}}
          onPress={() => {
            setType(
              type == BarCodeScanner.Constants.Type.back
                ? BarCodeScanner.Constants.Type.front
                : BarCodeScanner.Constants.Type.back
            );
          }}>
          <IconIonicons
            name="md-camera-reverse" 
            size={20} 
            color="white" 
            />
          <Text style={{ fontSize: 18, color: 'white' }}> Flip </Text>
        </TouchableOpacity>

        {scanned && 
        <View style={{flex:1, flexDirection:'row'}}>
          <Button titleStyle={{color: "#23396C"}} buttonStyle={styles.button} title={'SCANNER A NOUVEAU'} onPress={() => setScanned(false)} />
          <Button titleStyle={{color: "#23396C"}} buttonStyle={styles.button} title={'VOIR LE LIVRE >'} 
          onPress={() => {props.navigation.navigate('Book', {
            bookTitle: bookScanned.volumeInfo.title, 
            bookId: bookScanned.id, 
            bookAuthors:!bookScanned.volumeInfo.authors ? ["Unavailable"] :bookScanned.volumeInfo.authors,
            bookPublisher:!bookScanned.volumeInfo.publisher ? "Unavailable" :bookScanned.volumeInfo.publisher,
            bookDate:!bookScanned.volumeInfo.publishedDate ? "Unavailable" :bookScanned.volumeInfo.publishedDate,
            bookPageCount:!bookScanned.volumeInfo.pageCount ? "Unavailable" : bookScanned.volumeInfo.pageCount,
            bookCategories:!bookScanned.volumeInfo.categories ? ["Unavailable"] : bookScanned.volumeInfo.categories,
            bookDescription:!bookScanned.volumeInfo.description ? "Unavailable" :bookScanned.volumeInfo.description,
            bookCover: !bookScanned.volumeInfo.imageLinks ? "Unavailable" : bookScanned.volumeInfo.imageLinks.thumbnail,
          })}} />
        </View>
      }

      </BarCodeScanner>
    </View>
  } else if (isEnabled === false) {
        barCodeDisplay = 
          <View style={{flex:1}}>
            {hasSearched && result.length === 0 && <Text style={{textAlign:"center"}}>Aucun Résultat, veuillez reformuler votre recherche </Text> }
            {hasSearched && result.length > 0 && result[0] !== "start" &&
              <ScrollView style={{ marginTop: 25, width:"100%"}} containerStyle={{flex:1}}>
              {
                result.map((book,i) => (
                    <BookCard 
                    navigation={props.navigation}
                    bookId={book.id} 
                    bookTitle={book.volumeInfo.title} 
                    bookCover={!book.volumeInfo.imageLinks ? "Unavailable" : book.volumeInfo.imageLinks.thumbnail}
                    bookAuthors={book.volumeInfo.authors}
                    bookDate={book.volumeInfo.publishedDate}
                    bookPublisher={!book.volumeInfo.publisher ? "Unavailable" :book.volumeInfo.publisher}
                    bookPageCount={!book.volumeInfo.pageCount ? "Unavailable" : book.volumeInfo.pageCount}
                    bookCategories={!book.volumeInfo.categories ? ["Unavailable"] : book.volumeInfo.categories}
                    bookDescription={!book.volumeInfo.description ? "Unavailable" :book.volumeInfo.description}
                    key={i}
                    />
                ))
              }
              </ScrollView> 
            }
          </View>
       };

  return (
    
    <SafeAreaView style={{ flex: 1, flexDirection:'column', justifyContent:'flex-start'}}>
      <View  >
      <Text style={{ textAlign: 'center',fontSize: 17, fontWeight:'600', marginTop:12, marginBottom:10}}>Recherche</Text>
        <View style={{flexDirection:'row', alignItems:'center', backgroundColor:'#E5E5E5'}}>
          <SearchBar
            searchIcon={{ size: 24 }}
            onChangeText={(text) => searchFunction(text)}
            onClear={(text) => searchFunction('')}
            placeholder="Recherche un livre, auteur, ISBN,..."
            value={search}
            searchIcon="null"
            lightTheme="true"
            containerStyle={{backgroundColor:'#E5E5E5', width:'76%'}}
            inputContainerStyle={{backgroundColor:'#E5E5E5',height:35}}
            showLoading={isFetching}
            onFocus={() => setIsEnabled(false)}
          >
          </SearchBar>
          <Toggle
          leftComponent={
            <IconIonicons name="search" size={24} color="white" />
          }
          rightComponent={
            <IconIonicons name="barcode" size={24} color="white" />
          }
          onPress={toggleSwitch}
          value={isEnabled}
          trackBar={{
            activeBackgroundColor: '#C4C4C4',
            inActiveBackgroundColor: '#C4C4C4',
            borderActiveColor: '#E5E5E5',
            borderInActiveColor: '#E5E5E5',
            borderWidth: 3,
            width: 88,
          }}
          trackBarStyle={{
            borderColor: '#C4C4C4',
          }}
          thumbButton={{activeBackgroundColor:'#23396C',inActiveBackgroundColor:'#23396C' }}
      />
        </View>
        </View>
      {barCodeDisplay}
 
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    height:'100%'
    },
  description: {
    fontSize: 18,
    marginTop: '12%',
    textAlign: 'center',
    width: '70%',
    color: 'white',
  },
  qr: {
    marginTop: '22%',
    marginBottom: '20%',
    width: 238,
    height:140
  },
  button: {
    backgroundColor: '#FCA311',
    margin:5
  }
});
 
 function mapDispatchToProps(dispatch) {
  return {
  }
}

export default connect(
  null, 
  mapDispatchToProps
)(SearchScreen);

