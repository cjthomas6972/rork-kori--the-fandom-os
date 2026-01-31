import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ImageIcon, Plus } from 'lucide-react-native';
import KORI_COLORS from '@/constants/colors';
import { useUniverse } from '@/contexts/UniverseContext';
import { getUserUniverseProfile } from '@/mocks/socialUsers';
import { MistBackground } from '@/components/lunar';
import PlanetHeader from '@/components/PlanetHeader';

const CURRENT_USER_ID = 'user_001';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 48 - 8) / 2;

export default function PlanetGalleryScreen() {
  const router = useRouter();
  const { selectedUniverseId } = useUniverse();

  const universeProfile = useMemo(
    () => selectedUniverseId ? getUserUniverseProfile(CURRENT_USER_ID, selectedUniverseId) : null,
    [selectedUniverseId]
  );

  const galleryImages = universeProfile?.media.galleryUrls || [];

  const handleImagePress = (index: number) => {
    router.push(`/fullscreen-viewer?images=${encodeURIComponent(JSON.stringify(galleryImages))}&index=${index}` as any);
  };

  return (
    <View style={styles.container}>
      <MistBackground />
      <PlanetHeader title="Gallery" />
      <View style={styles.contentArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {galleryImages.length > 0 ? (
            <View style={styles.gridContainer}>
              {galleryImages.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.imageContainer}
                  onPress={() => handleImagePress(idx)}
                >
                  <Image source={{ uri }} style={styles.image} resizeMode="cover" />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addImageContainer}>
                <Plus size={32} color={KORI_COLORS.text.tertiary} />
                <Text style={styles.addText}>Add Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <ImageIcon size={48} color={KORI_COLORS.text.tertiary} />
              <Text style={styles.emptyTitle}>No images yet</Text>
              <Text style={styles.emptySubtitle}>
                Add images to your gallery to showcase your fandom identity
              </Text>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={18} color={KORI_COLORS.text.primary} />
                <Text style={styles.addButtonText}>Add First Image</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KORI_COLORS.bg.primary,
  },
  contentArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addImageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    backgroundColor: KORI_COLORS.glass.bg,
    borderWidth: 2,
    borderColor: KORI_COLORS.glass.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addText: {
    fontSize: 13,
    color: KORI_COLORS.text.tertiary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: KORI_COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: KORI_COLORS.accent.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: KORI_COLORS.text.primary,
  },
  bottomPadding: {
    height: 40,
  },
});
