export interface MemberData {
  id: string;
  name: string;
  cpf: string;
  discount: number;
}

export interface ProductData {
  name: string;
  price: number;
  stock: number;
}

export type ScanKind = 'qr' | 'barcode';

export interface ScanResult {
  raw: string;
  kind: ScanKind;
  member?: MemberData;
  product?: {
    barcode: string;
    data: ProductData;
  };
}
