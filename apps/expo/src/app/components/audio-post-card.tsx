import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Feather } from "@expo/vector-icons"; // Play/Pause icon

import type { CardProps } from "./type";
import { formatBytes, formatDuration } from "~/utils/utils";

// import { fetchAudio } from "./fetchAudio"; // Your tRPC or API call to fetch audio
// import { formatBytes, formatDuration } from "./utils"; // Utility functions for formatting size and duration

const AudioPostCard = ({ post }: CardProps) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioSize, setAudioSize] = useState<number | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const downloadAndPlayAudio = async () => {
    setIsLoading(true);
    const filePath = `${FileSystem.documentDirectory}al-ghurobaa/media/${post.title}.mp3`;

    // Check if audio exists locally
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (fileInfo.exists) {
      // Load audio from local file
      const { sound: loadedSound, status } = await Audio.Sound.createAsync(
        { uri: filePath },
        { shouldPlay: true },
      );
      setSound(loadedSound);
      setAudioUri(filePath);
      setAudioSize(fileInfo.size || null);
      setAudioDuration(status.durationMillis || null);
      setIsPlaying(true);
    } else {
      // Fetch audio URL via tRPC or API
      //   const audioUrl = await fetchAudio(post.audio.fileId); // Your tRPC call to fetch the audio URL
      const audioUrl = "";
      // Stream the audio immediately
      const { sound: streamedSound, status } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
      );
      setSound(streamedSound);
      setAudioUri(audioUrl);
      setAudioDuration(status.durationMillis || null);
      setIsPlaying(true);

      // Download audio and save to local storage in the background
      const { size } = await FileSystem.downloadAsync(audioUrl, filePath);
      setAudioSize(size);
    }

    setIsLoading(false);
  };

  const togglePlayPause = async () => {
    if (!sound && !isPlaying) {
      // Start download and play when first clicked
      await downloadAndPlayAudio();
    } else if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  return (
    <View className="rounded-lg bg-white p-4 shadow-md">
      <View className="flex-row items-center">
        {/* Play/Pause Button */}
        <TouchableOpacity onPress={togglePlayPause} className="mr-4">
          <Feather
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={40}
            color="blue"
          />
        </TouchableOpacity>

        {/* Audio Metadata */}
        <View className="flex-1">
          <Text className="text-lg font-semibold">{post.title}</Text>
          {post.caption && (
            <Text className="text-sm text-gray-500">{post.caption}</Text>
          )}
          {post.album && (
            <Text className="text-sm text-gray-400">Album: {post.album}</Text>
          )}
          {post.author && (
            <Text className="text-sm text-gray-400">Author: {post.author}</Text>
          )}
        </View>
      </View>

      {/* Audio Info */}
      <View className="mt-3 flex-row justify-between">
        {/* Audio Duration */}
        {audioDuration && (
          <Text className="text-xs text-gray-500">
            Length: {formatDuration(audioDuration)}
          </Text>
        )}
        {/* Audio Size */}
        {audioSize && (
          <Text className="text-xs text-gray-500">
            Size: {formatBytes(audioSize)}
          </Text>
        )}
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <ActivityIndicator size="small" color="#0000ff" className="mt-2" />
      )}
    </View>
  );
};

export default AudioPostCard;
