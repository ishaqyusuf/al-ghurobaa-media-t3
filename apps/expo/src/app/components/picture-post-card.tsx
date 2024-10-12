import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import FileSystem from "expo-file-system";

export const PicturePostCard = ({ post }) => {
  return (
    <View>
      <Text>PICTURE CARD</Text>
    </View>
  );
  //   const [imageUri, setImageUri] = useState(null);

  //   useEffect(() => {
  //     const loadImage = async () => {
  //       const filePath = `${FileSystem.documentDirectory}al-ghurobaa/picture/${post.title}.jpg`;
  //       const fileExists = await FileSystem.getInfoAsync(filePath);

  //       if (fileExists.exists) {
  //         // setImageUri(filePath);
  //       } else {
  //         // const imageUrl = await fetchImage(post.picture.fileId); // Fetch image URL via tRPC
  //         // await FileSystem.downloadAsync(imageUrl, filePath);
  //         // setImageUri(filePath);
  //       }
  //     };
  //     loadImage();
  //   }, []);

  //   return imageUri ? <Image source={{ uri: imageUri }} /> : <></>;
};
