import { LogBox, Share, TouchableOpacity } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']);

import React, {useEffect, useState} from 'react';

import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import WishlistScreen from './screens/WishlistScreen';
import LibraryScreen from './screens/LibraryScreen';
import AccountScreen from './screens/AccountScreen';
import BookScreen from './screens/BookScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';


import { Ionicons } from '@expo/vector-icons';

import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import avatar from './reducers/avatar.reducer';
import user from './reducers/user.reducer';
import library from './reducers/library.reducer';
import wishlist from './reducers/wishlist.reducer';


const store = createStore(combineReducers({avatar, user, library, wishlist}));

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const BottomNavigator = () => {

  const isFocused = useIsFocused()
  const [ badgeCountLB, setBadgeCountLB ] = useState(0);
  const [ badgeCountWL, setBadgeCountWL ] = useState(0);

useEffect(() => {
    setBadgeCountLB(store.getState().library.length)
    setBadgeCountWL(store.getState().wishlist.length) 
},[isFocused])

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;

          if (route.name == 'Recherche') {
            iconName = 'search';
          } else if (route.name == 'Ma Bibliothèque') {
            iconName = 'library-outline';
          } else if (route.name == "Ma Liste d'envies") {
            iconName = 'heart-outline';
          } else if (route.name == "Mon Compte") {
            iconName = 'ios-person-outline';
          };

          return <Ionicons name={iconName} size={25} color={color} />;
        },
        })}
      tabBarOptions={{
        activeTintColor: '#FCA311',
        inactiveTintColor: '#E5E5E5',
        labelPosition: 'below-icon',
        style: {
          backgroundColor: '#23396C',
          paddingBottom: 3,
          paddingTop:2
        }
      }}
    >
      <Tab.Screen name="Recherche" component={SearchScreen} />      
      <Tab.Screen name="Ma Bibliothèque" component={LibraryScreen}  options={{ tabBarBadge: (badgeCountLB >0 ? badgeCountLB : null), tabBarBadgeStyle:{backgroundColor:"#FCA311", color:"white"} }} />
      <Tab.Screen name="Ma Liste d'envies" component={WishlistScreen} options={{ tabBarBadge: (badgeCountWL >0 ? badgeCountWL : null), tabBarBadgeStyle:{backgroundColor:"#FCA311", color:"white"} }}/> 
      <Tab.Screen name="Mon Compte" component={AccountScreen} />    
    </Tab.Navigator>
  );
}

export default function App() {  

  const onShare = async (title, authors) => {
    try {
      const result = await Share.share({
        message: `Je te conseille ce livre sur l'appli book_in: ${title} de ${authors}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };


  return (    
<Provider store={store}>
  <NavigationContainer >      
    <Stack.Navigator  initialRouteName="Home" screenOptions={{headerBackImage: () => <Ionicons name="chevron-back" size={30} color="black" />, headerBackTitleVisible:false}}>        
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>        
    <Stack.Screen name="BottomNavigator" component={BottomNavigator} options={{ headerShown: false, headerBackTitleVisible:false }}/>
    <Stack.Screen name="Book" component={BookScreen} 
      options={({ route }) => ({
        title: route.params.bookTitle, 
        headerRight: () => (
          <TouchableOpacity onPress={() => onShare(route.params.bookTitle, route.params.bookAuthors)}><Ionicons name="ios-share-outline" size={28} color="black" /></TouchableOpacity>
        ),
        headerRightContainerStyle:{paddingRight:2}
       })
      }/>        
    <Stack.Screen name="Inscription" component={CreateAccountScreen}/>        

    </Stack.Navigator>    
  </NavigationContainer> 
</Provider> 
    );
  }

/*
To do:
> fichier env pour fetch et bdd
> mep sur heroku

SearchScreen:
  > Tri
  > Nb de résultat
  > Pagination

BookScreen:
  > Du même auteur ?
  > Mettre Tab ?

Bibliothèque / Wishlist:
  > NB dedans
  > Swipe to delete

Create Account Screen
  > avatar par défaut
  > Check sur mot de passe

  https://bookin-mobile-backend.herokuapp.com/
  http://192.168.1.32:3000
  */