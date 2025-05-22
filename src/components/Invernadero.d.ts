import { RefObject } from 'react';
import * as THREE from 'three';

export interface InvernaderoRef extends THREE.Group {
  moveToDefault: () => void;
  isLoading?: boolean;
  isLoadingState?: boolean;
}

export interface InvernaderoProps {
  onViewChange: (view: string) => void;
  showMap?: boolean;
}

declare const Invernadero: React.ForwardRefExoticComponent<InvernaderoProps & React.RefAttributes<InvernaderoRef>>;

export default Invernadero; 