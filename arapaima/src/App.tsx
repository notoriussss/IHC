import { Border } from '@/components/ui/Border';
import { Input } from '@/components/ui/Input';
import { ChatIcon } from '@/components/ui/ChatIcon';

export default function Example() {
  return (
    <div
      className="relative w-full h-screen bg-[#2d2d2d] overflow-hidden"
      style={{
        backgroundImage: "url('/src/assets/background/background-desktop.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Imágenes debajo de las esquinas */}
      <div className="absolute top-0 left-0 z-0">
        <img
          src="/src/assets/background/sun.svg"
          alt="Top Left Image"
          className="w-250 h-250"
        />
      </div>
      <div className="absolute top-0 right-0 z-0">
        <img
          src="/src/assets/background/leaf.svg"
          alt="Top Right Image"
          className="w-100 h-100"
        />
      </div>
      <div className="absolute top-0 right-0 z-0 mix-blend-saturation">
        <img
          src="/src/assets/background/leaf-background.svg"
          alt="Top Right Background Image"
          className="w-150 h-150"
        />
      </div>
      <div className="absolute bottom-0 left-0 z-0">
        <img
          src="/src/assets/background/fire.svg"
          alt="Top Right Background Image"
          className="w-300 h-300"
        />
      </div>
      <div className="absolute bottom-0 right-0 z-0">
        <img
          src="/src/assets/background/water.svg"
          alt="Top Right Background Image"
          className="w-225 h-125"
        />
      </div>
      
      {/* Esquinas decorativas */}
      <div className="absolute top-0 left-0 z-10">
        <Border src="/src/assets/icons/border_top_left.svg" alt="Top Left Border" />
      </div>
      <div className="absolute top-0 right-0 z-10">
        <Border src="/src/assets/icons/border_top_right.svg" alt="Top Right Border" />
      </div>
      <div className="absolute bottom-0 left-0 z-10">
        <Border src="/src/assets/icons/border_bottom_left.svg" alt="Bottom Left Border" />
      </div>
      <div className="absolute bottom-0 right-0 z-10">
        <Border src="/src/assets/icons/border_bottom_right.svg" alt="Bottom Right Border" />
      </div>
    </div>
  );
}
