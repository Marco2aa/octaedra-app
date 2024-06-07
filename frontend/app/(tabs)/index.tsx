import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Colors } from "../../constants/Colors";
import { useTheme } from "@/components/ThemeContext";
import axios from "axios";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";

const Index = () => {
  type Server = {
    id: number;
    url: string;
    nom: string;
    protocole: string;
    qualite_signal: string;
    mode_connexion: string;
    domain: boolean;
    verify_ssl: boolean;
    method: string;
    ipv6: boolean;
  };

  const [servers, setServers] = useState<Server[]>([]);
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [portsMap, setPortsMap] = useState<{ [key: string]: number }>({});
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getServers();
      setRefreshing(false);
    }, 2000);
  }, []);

  const getServers = async () => {
    try {
      const response = await axios.get<Server[]>(
        "http://192.168.1.94:8000/urls"
      );
      const fetchedServers = response.data;
      const portPromises = fetchedServers.map(async (server) => {
        try {
          const response = await axios.get(
            `http://192.168.1.94:8000/number-of-ports/${server.id}`
          );
          const numberOfPorts = response.data;
          return { id: server.id, numberOfPorts };
        } catch (error) {
          console.error(
            "Erreur lors de la récupération du nombre de ports pour le serveur",
            server.id,
            error
          );
          return null;
        }
      });
      const resolvedPorts = await Promise.all(portPromises);
      const validPorts = resolvedPorts.filter(
        (port): port is { id: number; numberOfPorts: number } => port !== null
      );
      const portsMap = validPorts.reduce<{ [key: string]: number }>(
        (acc, port) => {
          acc[port.id] = port.numberOfPorts;
          return acc;
        },
        {}
      );
      setServers(fetchedServers);
      setPortsMap(portsMap);
    } catch (error) {
      console.error("Erreur lors de la récupération des serveurs", error);
    }
  };

  const deleteServerById = async (id: number) => {
    try {
      const response = await axios.delete(
        `http://192.168.1.94:8000/delete-url/${id}`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Erreur lors de la suppresion de l'élément", error);
    }
  };

  useEffect(() => {
    getServers();
  }, []);

  const { theme } = useTheme();

  const backgroundColor =
    theme === "dark" ? Colors.dark.background : Colors.light.background;
  const textColor = theme === "dark" ? Colors.dark.text : Colors.light.text;

  const handleLongPress = (id: number) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cet élément ?",
      [
        {
          text: "Annuler",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Supprimer",
          onPress: () => deleteServerById(id),
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView
      style={[styles.mainContainer, { backgroundColor }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {servers.map((item) => (
        <Pressable
          key={item.id}
          onLongPress={() => handleLongPress(item.id)}
          onPress={() =>
            router.push({
              pathname: "/Serveurs/[id]",
              params: { id: item.id },
            })
          }
        >
          <View
            style={[
              styles.containerItem,
              {
                backgroundColor:
                  theme === "dark"
                    ? Colors.dark.itemcontainer
                    : Colors.light.itemcontainer,
              },
            ]}
          >
            <View style={styles.iconcontainer}>
              <AntDesign name="earth" size={24} color="black" />
            </View>
            <View style={styles.itemContent}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 13,
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <Text
                  style={[
                    styles.text,
                    { color: "orange", fontSize: 26, fontWeight: "600" },
                  ]}
                >
                  {item.nom}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row-reverse",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Text style={[styles.text, { color: "grey" }]}>{item.url}</Text>
                <Text style={[styles.text, { color: "grey" }]}>
                  {item.protocole}
                </Text>
              </View>
              <Text style={[styles.text, { color: textColor }]}>
                {item.qualite_signal}
              </Text>

              <Text style={[styles.text, { color: textColor }]}>
                {portsMap[item.id] === 0
                  ? "Cliquez pour scanner"
                  : `Nombre de ports scannés : ${portsMap[item.id]}`}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    marginBottom: 65,
  },
  containerItem: {
    borderRadius: 8,
    padding: 10,
    paddingLeft: 12,
    marginTop: 5,
    marginHorizontal: 10,
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
    overflow: "hidden",
  },
  itemContent: {},
  text: {
    fontSize: 20,
    fontWeight: "300",
  },
  list: {
    paddingBottom: 30,
    marginBottom: 80,
  },
  iconcontainer: {
    backgroundColor: "orange",
    borderRadius: 8,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
});
