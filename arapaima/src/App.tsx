import { Border } from '@/components/ui/Border';
import { Input } from '@/components/ui/Input';
import { ChatIcon } from '@/components/ui/ChatIcon';

export default function Example() {
  return (
    <div className="relative w-full h-screen bg-[#2d2d2d]">
      {/* Esquinas decorativas */}
      <div className="absolute top-0 left-0">
        <Border src="/src/assets/border_top_left.svg" alt="Top Left Border" />
      </div>
      <div className="absolute top-0 right-0">
        <Border src="/src/assets/border_top_right.svg" alt="Top Right Border" />
      </div>
      <div className="absolute bottom-0 left-0">
        <Border src="/src/assets/border_bottom_left.svg" alt="Bottom Left Border" />
      </div>
      <div className="absolute bottom-0 right-0">
        <Border src="/src/assets/border_bottom_right.svg" alt="Bottom Right Border" />
      </div>

      {/* Contenedor principal centrado */}
      <div className="flex items-center justify-center w-full h-full flex-col" id="main-content">
        
        {/* Imagen SVG decorativa */}
        <div className="mb-4">
          <img src="/src/assets/kuai-mare.svg" alt="Decorative SVG" className="w-100 h-100" />
        </div>

        {/* Texto decorativo */}
        <div className="text-center text-white max-w-md mb-10">
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sequi suscipit sed quos nam repudiandae sapiente voluptatibus iste, laboriosam nesciunt explicabo ex iure. Quis tempore veritatis eius hic necessitatibus. Fugit, quo?
          </p>
        </div>
        
        {/* Input */}
        <Input icon={<ChatIcon />} placeholder="Pregúntame lo que quieras sobre el agua..." />
      </div>
    </div>
  );
}