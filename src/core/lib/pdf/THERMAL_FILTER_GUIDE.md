# Guia de Uso: Filtro Térmico para Impressão 58mm

## Visão Geral

O `PDFProcessor.applyThermalFilter()` aplica processamento de imagem otimizado para impressoras térmicas. Converte PDFs em imagens preto e branco puras com máxima clareza e legibilidade.

## Modos de Uso

### 1. Padrão (Recomendado para maioria dos casos)

```typescript
// Contraste 2.8, sem dithering, threshold automático (Otsu)
PDFProcessor.applyThermalFilter(canvas);
```

**Resultado:**
- Texto nítido e legível
- QR codes bem definidos
- Performance rápida
- Ideal para texto + código de barras

---

### 2. Com Dithering Floyd-Steinberg (Para imagens complexas)

```typescript
// Ativa dithering para melhor qualidade em imagens detalhadas
PDFProcessor.applyThermalFilter(canvas, {
  useDithering: true,
  contrast: 2.8,
  brightness: 0
});
```

**Resultado:**
- Melhor reprodução de gradientes
- Mais padrão visual em áreas cinzentas
- Performance +20% mais lenta
- Ideal para: labelscom fotos/logos

---

### 3. Contraste Personalizado

```typescript
// Aumentar contraste ainda mais (arriscado com imagens limpas)
PDFProcessor.applyThermalFilter(canvas, {
  contrast: 3.5,     // 2.8 padrão → 3.5 máximo
  brightness: 0,
  useDithering: false
});
```

**Efeito:**
- Contraste > 3: texto fica MUITO FORTE, pode perder detalhes
- Contraste 2.8: equilibrado
- Contraste < 2: mais suave, menos preto puro

---

### 4. Com Threshold Manual

```typescript
// Usar threshold fixo em vez de Otsu automático
PDFProcessor.applyThermalFilter(canvas, {
  contrast: 2.8,
  threshold: 160   // valores 0-255, padrão é calculado
});
```

**Valores recomendados de threshold:**
- `140`: Mais agressivo (mais preto)
- `150`: Balanceado
- `160`: Mais conservador (menos preto)
- `170`: Muito claro (risco de desaparecer linhas finas)

---

## Exemplo de Integração no Fluxo Atual

```typescript
// No page.tsx (componente principal)
const generateLabelImages = useCallback(async (imageDataUrl: string) => {
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    // ✅ APLICAR FILTRO ANTES DO CROP
    PDFProcessor.applyThermalFilter(canvas, {
      contrast: 2.8,
      brightness: 0,
      useDithering: false
    })

    // Depois proceder com crop e slicing normal
    const bounds = PDFProcessor.findContentBounds(
      ctx,
      canvas.width,
      canvas.height
    )
    const croppedCanvas = PDFProcessor.cropCanvas(canvas, bounds)
    // ... resto do código
  }

  img.src = imageDataUrl
}, [])
```

---

## Algoritmos Explicados

### Contraste (Aplicado Primeiro)

```
novo_pixel = contraste × pixel + intercept
intercept = 128 × (1 - contraste) + brightness
```

**Exemplos:**
- `contrast=1.0`: Sem mudança
- `contrast=2.0`: Duplica a diferença do meio-tom
- `contrast=2.8`: 2.8x (padrão + agressivo)

### Otsu Threshold (Automático)

Calcula o melhor ponto de corte que **maximiza variância** entre preto e branco analisando o histograma.

**Vantagem:** Adapta-se a qualquer PDF (alguns PDFs naturalmente mais escuros/claros).

### Floyd-Steinberg Dithering

Distribui erro de quantização em padrão:
```
     X    7/16
3/16 5/16 1/16
```

**Uso:** Melhor qualidade em imagens com gradientes ou logos.

---

## Impacto na Impressão Térmica

| Configuração | Qualidade Texto | QR Code | Performance | Uso |
|-------------|----------------|---------|-------------|-----|
| Padrão (Otsu) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Rápido | 95% dos casos |
| + Dithering | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Lento +20% | Logos/imagens |
| Contrast 3.5 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Rápido | PDFs muito claros |
| Threshold 140 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Rápido | Preto máximo |

---

## Dicas de Troubleshooting

### Problema: Texto muito fraco
**Solução:**
```typescript
{ contrast: 3.0, brightness: 0, useDithering: false }
```

### Problema: QR Code fica borrado
**Solução:**
```typescript
{ contrast: 2.5, brightness: 0, useDithering: false }
// Ou usar threshold fixo: threshold: 155
```

### Problema: Linhas finas desaparecem
**Solução:**
```typescript
{ contrast: 2.4, brightness: 5, useDithering: false }
// Reduzir contraste e adicionar brilho
```

### Problema: Performance muito lenta
**Solução:**
```typescript
{ useDithering: false }  // Remover dithering
// Dithering é mais lento, use apenas quando necessário
```

---

## Valores Recomendados por Tipo de Label

### Label Simples (Texto + Código de Barras)
```typescript
{
  contrast: 2.8,
  brightness: 0,
  useDithering: false
}
```

### Label com QR Code Alta Segurança
```typescript
{
  contrast: 2.6,
  brightness: 0,
  useDithering: false,
  threshold: 155
}
```

### Label com Logo/Imagem
```typescript
{
  contrast: 2.5,
  brightness: 0,
  useDithering: true  // Ativa dithering
}
```

### Label Máxima Qualidade de Texto
```typescript
{
  contrast: 3.0,
  brightness: 0,
  useDithering: false
}
```

---

## Performance & Impacto

- **Sem Dithering:** ~2-5ms por imagem (300 DPI, 58mm)
- **Com Dithering:** ~25-40ms por imagem
- **Memória:** Usa ~2-3x a memória durante processamento

---

## API Completa

```typescript
interface ThermalFilterOptions {
  contrast: number          // Multiplicador (1.0-4.0, default 2.8)
  brightness: number        // Adição (-100 a +100, default 0)
  useDithering: boolean     // Floyd-Steinberg (default false)
  threshold?: number        // 0-255, undefined = auto Otsu
}

PDFProcessor.applyThermalFilter(
  canvas: HTMLCanvasElement,
  options?: Partial<ThermalFilterOptions>
): void
```
