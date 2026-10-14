FROM runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04
RUN pip install --no-cache-dir runpod==1.7.* diffusers==0.34.* transformers accelerate sentencepiece imageio imageio-ffmpeg
# Bake weights into the image so cold starts don't download 20+ GB.
ARG LTX_MODEL_ID=Lightricks/LTX-Video-0.9.8-13B-distilled
ENV LTX_MODEL_ID=${LTX_MODEL_ID}
RUN python -c "from diffusers import LTXConditionPipeline; LTXConditionPipeline.from_pretrained('${LTX_MODEL_ID}')"
COPY handler.py /handler.py
CMD ["python", "-u", "/handler.py"]
