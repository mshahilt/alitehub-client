import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text } from 'react-konva';
import ReactCrop, { Crop } from 'react-image-crop';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import 'react-image-crop/dist/ReactCrop.css';

// Types
interface StageObject {
  id: string;
  type: 'emoji';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  isDragging: boolean;
}

interface ImageEditorProps {
  initialImage: string;
  onSave: (editedImageUrl: string) => void;
  width?: number;
  height?: number;
}

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;

const emojiList = ['😀', '😍', '🔥', '👍', '🎉', '⭐', '🌈', '🚀', '🎨', '🌟', '🍕', '🎸', '📷', '🏆', '❤️'];

const ImageEditor: React.FC<ImageEditorProps> = ({ 
  initialImage, 
  onSave, 
  width = CANVAS_WIDTH, 
  height = CANVAS_HEIGHT 
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string>(initialImage);
  const [objects, setObjects] = useState<StageObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [stageWidth, setStageWidth] = useState<number>(width);
  const [stageHeight, setStageHeight] = useState<number>(height);
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number | null>(null);
  
  const stageRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load image
  useEffect(() => {
    console.log(originalAspectRatio);
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      setImage(img);
      setOriginalAspectRatio(img.width / img.height);
      
      // Determine best fit dimensions while maintaining aspect ratio
      let newWidth = width;
      let newHeight = height;
      
      const containerAspectRatio = width / height;
      const imageAspectRatio = img.width / img.height;
      
      if (imageAspectRatio > containerAspectRatio) {
        // Image is wider than container's aspect ratio
        newHeight = width / imageAspectRatio;
      } else {
        // Image is taller than container's aspect ratio
        newWidth = height * imageAspectRatio;
      }
      
      // Ensure we don't exceed the container bounds
      if (newWidth > width) {
        newWidth = width;
        newHeight = width / imageAspectRatio;
      }
      
      if (newHeight > height) {
        newHeight = height;
        newWidth = height * imageAspectRatio;
      }
      
      setStageWidth(newWidth);
      setStageHeight(newHeight);
    };
  }, [imageSrc, width, height]);

  // Handle crop completion
  const handleCropComplete = (crop: Crop) => {
    setCompletedCrop(crop);
  };

  // Apply crop to image
  const applyCrop = () => {
    if (!completedCrop || !imageRef.current) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(
      imageRef.current,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
    
    setImageSrc(canvas.toDataURL('image/jpeg'));
    setIsCropping(false);
    setCrop({
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0,
    });
  };

  // Add emoji to canvas
  const addEmoji = (emoji: string) => {
    const id = `emoji-${Date.now()}`;
    const newEmoji: StageObject = {
      id,
      type: 'emoji',
      x: stageWidth / 2,
      y: stageHeight / 2,
      text: emoji,
      fontSize: 30,
      isDragging: false,
    };
    
    setObjects([...objects, newEmoji]);
    setSelectedId(id);
  };

  // Handle object selection
  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  // Export final image
  const saveImage = () => {
    if (!stageRef.current) return;
    
    const uri = stageRef.current.toDataURL({ 
      pixelRatio: 2,
      mimeType: 'image/jpeg',
      quality: 0.9
    });
    
    onSave(uri);
  };

  // Delete selected object
  const handleDelete = () => {
    if (selectedId) {
      setObjects(objects.filter(obj => obj.id !== selectedId));
      setSelectedId(null);
    }
  };

  // Resize selected emoji
  const handleResizeEmoji = (value: number[]) => {
    if (selectedId) {
      setObjects(
        objects.map(obj => {
          if (obj.id === selectedId) {
            return {
              ...obj,
              fontSize: value[0],
            };
          }
          return obj;
        })
      );
    }
  };

  return (
    <Card className="w-full bg-blue-950 text-white">
      <CardHeader>
        <CardTitle>Image Editor</CardTitle>
        <CardDescription className="text-blue-300">
          Crop and add stickers to your image
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full flex justify-center">
          {isCropping ? (
            <div className="max-w-full">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={handleCropComplete}
                aspect={undefined}
              >
                <img 
                  ref={imageRef} 
                  src={imageSrc} 
                  style={{ maxWidth: '100%', maxHeight: '70vh' }} 
                  alt="Crop preview" 
                  crossOrigin="anonymous"
                />
              </ReactCrop>
              <div className="mt-4 flex gap-2">
                <Button onClick={applyCrop} variant="default">Apply Crop</Button>
                <Button onClick={() => setIsCropping(false)} variant="outline">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <Tabs defaultValue="stickers" className="w-full">
                <TabsList className="w-full mb-4 bg-blue-900">
                  <TabsTrigger value="stickers" className="flex-1">Stickers</TabsTrigger>
                  <TabsTrigger value="crop" className="flex-1">Crop</TabsTrigger>
                </TabsList>
                
                <TabsContent value="stickers" className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {emojiList.map((emoji) => (
                      <Button 
                        key={emoji} 
                        onClick={() => addEmoji(emoji)}
                        variant="outline"
                        className="text-2xl"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                  
                  {selectedId && objects.find(obj => obj.id === selectedId) && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm">Resize Emoji</p>
                      <Slider
                        defaultValue={[
                          objects.find(obj => obj.id === selectedId)?.fontSize || 30
                        ]}
                        max={100}
                        min={10}
                        step={1}
                        onValueChange={handleResizeEmoji}
                      />
                      <Button 
                        onClick={handleDelete} 
                        variant="destructive"
                        className="mt-2"
                      >
                        Delete Selected Emoji
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="crop">
                  <Button onClick={() => setIsCropping(true)} variant="default">
                    Start Cropping
                  </Button>
                </TabsContent>
              </Tabs>
              
              {image && (
                <div className="mt-4 border border-blue-800 rounded flex justify-center bg-blue-900">
                  <div style={{ width: `${stageWidth}px`, height: `${stageHeight}px` }} className="relative">
                    <Stage
                      ref={stageRef}
                      width={stageWidth}
                      height={stageHeight}
                      onMouseDown={checkDeselect}
                      onTouchStart={checkDeselect}
                    >
                      <Layer>
                        <KonvaImage
                          image={image}
                          width={stageWidth}
                          height={stageHeight}
                          listening={true}
                        />
                        {objects.map((obj) => {
                          return (
                            <Text
                              key={obj.id}
                              id={obj.id}
                              text={obj.text}
                              x={obj.x}
                              y={obj.y}
                              fontSize={obj.fontSize}
                              draggable
                              onClick={() => setSelectedId(obj.id)}
                              onTap={() => setSelectedId(obj.id)}
                              onDragStart={() => {
                                setObjects(
                                  objects.map(item => {
                                    return {
                                      ...item,
                                      isDragging: item.id === obj.id,
                                    };
                                  })
                                );
                              }}
                              onDragEnd={(e) => {
                                setObjects(
                                  objects.map(item => {
                                    if (item.id === obj.id) {
                                      return {
                                        ...item,
                                        isDragging: false,
                                        x: e.target.x(),
                                        y: e.target.y(),
                                      };
                                    }
                                    return {
                                      ...item,
                                      isDragging: false,
                                    };
                                  })
                                );
                              }}
                              opacity={obj.isDragging ? 0.5 : 1}
                              stroke={obj.id === selectedId ? "#0ea5e9" : ""}
                              strokeWidth={obj.id === selectedId ? 2 : 0}
                            />
                          );
                        })}
                      </Layer>
                    </Stage>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveImage} className="w-full">
          Save Edited Image
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ImageEditor;