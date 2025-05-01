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
        userSelect: 'none'
      }}
    >
      {/* Logo centrado horizontalmente */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
        <img
          src="/src/assets/logo/logo.svg"
          alt="Logo"
          className="w-80 h-auto"
          style={{ userSelect: 'none' }}
        />
        {/* Imagen kuai-mare debajo del logo */}
        <img
          src="/src/assets/chatbot/kuai-mare.svg"
          alt="Kuai Mare"
          className="w-125 h-auto mt-18"
          style={{ userSelect: 'none'}}
        />
        {/* Caja de texto debajo de kuai-mare */}
        <div
          className="w-[900px] h-[250px] text-white p-5 flex items-center justify-center text-center font-mono text-[35px]"
          style={{ userSelect: 'none' }}
        >
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>

      {/* Imágenes debajo de las esquinas */}
      <div className="absolute top-0 left-0 z-0">
        <img
          src="/src/assets/background/sun.svg"
          alt="Top Left Image"
          className="w-250 h-250"
          style={{ userSelect: 'none'}}
        />
      </div>
      <div className="absolute top-0 right-0 z-0">
        <img
          src="/src/assets/background/leaf.svg"
          alt="Top Right Image"
          className="w-100 h-100"
          style={{ userSelect: 'none'}}
        />
      </div>
      <div className="absolute top-0 right-0 z-0 mix-blend-saturation">
        <img
          src="/src/assets/background/leaf-background.svg"
          alt="Top Right Background Image"
          className="w-150 h-150"
          style={{ userSelect: 'none'}}
        />
      </div>
      <div className="absolute bottom-0 left-0 z-0">
        <img
          src="/src/assets/background/fire.svg"
          alt="Top Right Background Image"
          className="w-300 h-300"
          style={{ userSelect: 'none'}}
        />
      </div>
      <div className="absolute bottom-0 right-0 z-0">
        <img
          src="/src/assets/background/water.svg"
          alt="Top Right Background Image"
          className="w-225 h-125"
          style={{ userSelect: 'none'}}
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
