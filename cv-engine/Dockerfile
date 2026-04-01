FROM mcr.microsoft.com/playwright/python:v1.43.0-jammy

WORKDIR /app

# Instalar dependencias del sistema operativo y compiladores
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    tesseract-ocr \
    tesseract-ocr-spa \
    build-essential \
    python3-dev \
    libyaml-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Instalar PyTorch para CPU (minimiza tamaño sobre GPU)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Variables de entorno para asegurar que Detectron2 se instale para CPU
ENV FORCE_CUDA="0"
ENV TORCH_CUDA_ARCH_LIST="None"

# Instalar dependencias previas de detectron2
RUN pip install --no-cache-dir ninja pyyaml cython

# Instalar detectron2
RUN pip install --no-cache-dir 'git+https://github.com/facebookresearch/detectron2.git'

RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código
COPY . .

# Comando de inicio del servidor FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
