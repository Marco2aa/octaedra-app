import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { useTheme } from "@/components/ThemeContext";
import axios from "axios";
import { useTimerContext } from "../../components/TimerContext";
import { useDataContext } from "@/components/DataContext";

type Port = {
  id_port: string;
  port: string;
  service: string;
  status: string;
  latency: number;
  updatedAt: string;
};

const ServerDetail: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { subscribeToTimerEnd } = useTimerContext();
  const { state, dispatch } = useDataContext();

  const getPortsByServer = async () => {
    try {
      const response = await axios.get<Port[]>(
        `http://192.168.1.94:8000/ports/${id}`
      );
      console.log("Ports response:", response.data);
      const fetchedPorts = response.data;
      const completePorts = await Promise.all(
        fetchedPorts.map(async (port) => {
          try {
            const responseTwo = await axios.get(
              `http://192.168.1.94:8000/get/info-port/${port.id_port}`
            );
            const infoPortArray = responseTwo.data;
            if (infoPortArray.length > 0) {
              const { service, status, latency, updatedAt } = infoPortArray[0];
              console.log(
                `InfoPort for port ${port.id_port}:`,
                infoPortArray[0]
              );
              const completePort = {
                ...port,
                service,
                status,
                latency,
                updatedAt,
              };
              console.log("Complete port:", completePort);
              return completePort;
            } else {
              console.log(`No additional info found for port ${port.id_port}`);
              return port;
            }
          } catch (error) {
            console.error(
              `Erreur lors de la récupération des informations du port ${port.id_port}`,
              error
            );
            return port;
          }
        })
      );
      dispatch({ type: "SET_PORTS", payload: completePorts });
    } catch (error) {
      console.error(
        "Erreur lors de la recuperation des ports du serveur",
        error
      );
    }
  };

  const getInfoByUrl = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.94:8000/get/info-url/${id}`
      );
      console.log("Info URL response:", response.data);
      dispatch({ type: "SET_INFO_URL", payload: response.data });
    } catch (error) {
      console.error("Erreur lors de la récuperation des infos serveurs", error);
    }
  };

  useEffect(() => {
    getPortsByServer();
    getInfoByUrl();
  }, []);

  useEffect(() => {
    const handleTimerEnd = () => {
      getPortsByServer();
      getInfoByUrl();
    };

    subscribeToTimerEnd(handleTimerEnd);
  }, [subscribeToTimerEnd]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Server Details - ${id}`,
      headerStyle: {
        backgroundColor: "orange",
      },
      headerTintColor: "black",
      headerTitleStyle: {
        fontWeight: "bold",
      },
      headerRight: () => <MaterialIcons name="radar" size={34} color="black" />,
    });
  }, [navigation, id]);

  const { theme } = useTheme();

  const backgroundColor =
    theme === "dark" ? Colors.dark.background : Colors.light.background;
  const textColor = theme === "dark" ? Colors.dark.text : Colors.light.text;

  const renderPortItem = ({ item }: { item: Port }) => (
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
      <Pressable>
        <View>
          <Text style={[styles.text, { color: textColor }]}>{item.port}</Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor }]}>
      {state.infoUrl && (
        <View style={styles.infoContainer}>
          <Text style={[styles.text, { color: textColor }]}>
            IP Address: {state.infoUrl.ip_address}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Server Version: {state.infoUrl.server_version}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packets Sent: {state.infoUrl.packets_sent}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packets Received: {state.infoUrl.packets_received}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packets Lost: {state.infoUrl.packets_lost}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Average Latency: {state.infoUrl.avg_latency}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Min Latency: {state.infoUrl.min_latency}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Max Latency: {state.infoUrl.max_latency}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packet Sizes: {state.infoUrl.packet_sizes}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            ICMP Version: {state.infoUrl.icmp_version}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            TTL: {state.infoUrl.ttl}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            DNS Resolution Time: {state.infoUrl.dns_resolution_time}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            SSL Issuer: {state.infoUrl.ssl_issuer}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            SSL Issued On: {state.infoUrl.ssl_issued_on}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            SSL Issued On: {state.infoUrl.ssl_issued_on}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Domain Creation Date: {state.infoUrl.domain_creation_date}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Domain Expiration Date: {state.infoUrl.domain_expiration_date}
          </Text>
        </View>
      )}
      <View>
        <FlatList
          data={state.ports}
          keyExtractor={(item) => item.id_port}
          renderItem={renderPortItem}
          contentContainerStyle={styles.list}
          horizontal={true}
        />
      </View>
    </View>
  );
};

export default ServerDetail;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  infoContainer: {
    margin: 10,
  },
  infoItem: {
    marginBottom: 5,
  },
  containerItem: {
    borderRadius: 8,
    margin: 10,
    padding: 10,
    width: 250,
    height: 150,
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
    justifyContent: "space-around",
  },
  text: {
    fontSize: 18,
  },
  list: {
    paddingBottom: 30,
    marginBottom: 80,
  },
});
