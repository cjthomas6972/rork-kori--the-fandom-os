import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import KORI_COLORS from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FullscreenViewerScreen() {
  const router = useRouter();
  const { images, index } = useLocalSearchParams<{ images: string; index: string }>();
  const flatListRef = useRef<FlatList>(null);

  const imageList: string[] = images ? JSON.parse(decodeURIComponent(images)) : [];
  const initialIndex = parseInt(index || '0', 10);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleScroll = useCallback((event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(slideIndex);
  }, []);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < imageList.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  }, [currentIndex, imageList.length]);

  const renderImage = ({ item }: { item: string }) => (
    <View style={styles.imageWrapper}>
      <Image
        source={{ uri: item }}
        style={styles.fullImage}
        resizeMode="contain"
      />
    </View>
  );

  const handleReturn = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/planet');
    }
  };

  if (imageList.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No images to display</Text>
          <TouchableOpacity style={styles.closeButtonError} onPress={handleReturn}>
            <Text style={styles.closeButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <FlatList
        ref={flatListRef}
        data={imageList}
        renderItem={renderImage}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, idx) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * idx,
          index: idx,
        })}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
          <ChevronLeft size={20} color={KORI_COLORS.text.primary} />
          <Text style={styles.returnText}>Return</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>
          {currentIndex + 1} / {imageList.length}
        </Text>
        <View style={styles.spacer} />
      </View>

      {imageList.length > 1 && (
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={28} color={currentIndex === 0 ? KORI_COLORS.text.tertiary : KORI_COLORS.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === imageList.length - 1 && styles.navButtonDisabled]}
            onPress={goToNext}
            disabled={currentIndex === imageList.length - 1}
          >
            <ChevronRight size={28} color={currentIndex === imageList.length - 1 ? KORI_COLORS.text.tertiary : KORI_COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      )}

      {imageList.length > 1 && (
        <View style={styles.pagination}>
          {imageList.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  returnText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: KORI_COLORS.text.primary,
  },
  counter: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  spacer: {
    width: 40,
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  navigation: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: -24,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  pagination: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: KORI_COLORS.accent.gold,
    width: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: KORI_COLORS.text.secondary,
    marginBottom: 16,
  },
  closeButtonError: {
    backgroundColor: KORI_COLORS.accent.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
});
