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
  const { ports, setPorts, infoUrl, setInfoUrl } = useDataContext();

  const getPortsByServer = async () => {
    try {
      const response = await axios.get(`http://192.168.1.94:8000/ports/${id}`);
      console.log("Ports response:", response.data);
      setPorts(response.data);
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

      setInfoUrl(response.data);
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
      {infoUrl && (
        <View style={styles.infoContainer}>
          <Text style={[styles.text, { color: textColor }]}>
            IP Address: {infoUrl.ip_address}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Server Version: {infoUrl.server_version}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packets Sent: {infoUrl.packets_sent}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packets Received: {infoUrl.packets_received}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packets Lost: {infoUrl.packets_lost}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Average Latency: {infoUrl.avg_latency}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Min Latency: {infoUrl.min_latency}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Max Latency: {infoUrl.max_latency}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packet Sizes: {infoUrl.packet_sizes}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            ICMP Version: {infoUrl.icmp_version}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            TTL: {infoUrl.ttl}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            DNS Resolution Time: {infoUrl.dns_resolution_time}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            SSL Issuer: {infoUrl.ssl_issuer}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            SSL Issued On: {infoUrl.ssl_issued_on}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            SSL Issued On: {infoUrl.ssl_issued_on}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Domain Creation Date: {infoUrl.domain_creation_date}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Domain Expiration Date: {infoUrl.domain_expiration_date}
          </Text>
        </View>
      )}
      <View>
        <FlatList
          data={ports}
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
