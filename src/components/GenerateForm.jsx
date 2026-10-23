import React, { useState, useCallback } from 'react';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import ImageUploader from './ImageUploader.jsx';
import ResultModal from './ResultModal.jsx';
import GenerationLoader from './GenerationLoader.jsx';

const GenerateForm = ({
  slug,
  name,
  description,
  icon = 'image',
  detailsHint = 'Describe la escena o los detalles que quieres',
  requiresCelebrity = false,
}) => {
  const [formData, setFormData] = useState({
    personImage: null,
    celebrityImage: null,
    celebrityName: '',
    extraDetails: '',
    quality: 'medium',
  });

  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = useCallback((uploaderId, file) => {
    setFormData((prev) => ({
      ...prev,
      [uploaderId === 'person-image' ? 'personImage' : 'celebrityImage']: file,
    }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name: field, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const isFormValid = Boolean(formData.personImage) && (!requiresCelebrity || Boolean(formData.celebrityImage));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.personImage) {
      alert('Sube tu foto para continuar');
      return;
    }
    if (requiresCelebrity && !formData.celebrityImage) {
      alert('Sube la foto de la celebridad');
      return;
    }

    setIsGenerating(true);

    const submitData = new FormData();
    submitData.append('person', formData.personImage);
    submitData.append('extraDetails', formData.extraDetails);
    submitData.append('quality', formData.quality);
    if (requiresCelebrity) {
      submitData.append('celebrity', formData.celebrityImage);
      submitData.append('celebrityName', formData.celebrityName);
    }

    try {
      const response = await fetch(`/api/generate/${slug}`, {
        method: 'POST',
        body: submitData,
      });
      const payload = await response.json();
      if (payload.success) {
        setResult(payload);
      } else {
        alert(`Error: ${payload.error || 'No se pudo generar la imagen'}`);
      }
    } catch (error) {
      alert(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseResult = useCallback(() => {
    setResult(null);
  }, []);

  const handleCancelGeneration = useCallback(() => {
    setIsGenerating(false);
  }, []);

  React.useEffect(() => {
    const handleImageUploaded = (event) => {
      const { uploaderId, file } = event.detail;
      handleImageUpload(uploaderId, file);
    };

    window.addEventListener('imageUploaded', handleImageUploaded);
    return () => window.removeEventListener('imageUploaded', handleImageUploaded);
  }, [handleImageUpload]);

  return (
    <>
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className={`grid grid-cols-1 ${requiresCelebrity ? 'lg:grid-cols-2' : ''} gap-8`}>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-primary-800 mb-2">
              Tu foto
            </label>
            <ImageUploader
              id="person-image"
              placeholder="Arrastra tu foto aquí o haz clic para seleccionar"
            />
            <p className="text-xs text-accent-500">Formatos: JPG, PNG, WEBP • Máximo 10MB</p>
          </div>

          {requiresCelebrity && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-primary-800 mb-2">
                Foto de la celebridad
              </label>
              <ImageUploader
                id="celebrity-image"
                placeholder="Arrastra la foto de la celebridad aquí"
              />
              <p className="text-xs text-accent-500">Formatos: JPG, PNG, WEBP • Máximo 10MB</p>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 ${requiresCelebrity ? 'lg:grid-cols-2' : ''} gap-8`}>
          {requiresCelebrity && (
            <div className="space-y-4">
              <label htmlFor="celebrityName" className="block text-sm font-semibold text-primary-800 mb-2">
                Nombre de la celebridad
              </label>
              <input
                type="text"
                id="celebrityName"
                name="celebrityName"
                value={formData.celebrityName}
                onChange={handleInputChange}
                placeholder="Ej: Leonardo DiCaprio, Brad Pitt..."
                className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
              <p className="text-xs text-accent-500">
                Indica quién aparece en la foto para mejorar el resultado
              </p>
            </div>
          )}

          <div className="space-y-4">
            <label htmlFor="extraDetails" className="block text-sm font-semibold text-primary-800 mb-2">
              Detalles adicionales
            </label>
            <textarea
              id="extraDetails"
              name="extraDetails"
              value={formData.extraDetails}
              onChange={handleInputChange}
              rows="3"
              placeholder={detailsHint}
              className="w-full px-4 py-3 border border-accent-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-none"
            />
            <p className="text-xs text-accent-500">{detailsHint}</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-primary-800 mb-4">
            Calidad de generación
          </label>
          <div className="flex items-center justify-center space-x-8 bg-accent-50 p-6 rounded-xl">
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  value="medium"
                  checked={formData.quality === 'medium'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`relative w-6 h-6 rounded-full border-2 transition-colors ${
                  formData.quality === 'medium'
                    ? 'border-primary-600 bg-primary-600'
                    : 'border-accent-300'
                }`}>
                  {formData.quality === 'medium' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="font-medium text-primary-800">Media</div>
                  <div className="text-xs text-accent-500">Más rápida • Menos tokens</div>
                </div>
              </label>

              <div className="h-8 w-px bg-accent-300"></div>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  value="high"
                  checked={formData.quality === 'high'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`relative w-6 h-6 rounded-full border-2 transition-colors ${
                  formData.quality === 'high'
                    ? 'border-secondary-500 bg-secondary-500'
                    : 'border-accent-300'
                }`}>
                  {formData.quality === 'high' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="font-medium text-primary-800">Alta</div>
                  <div className="text-xs text-accent-500">Mejor calidad • Más tokens</div>
                </div>
              </label>
            </div>
          </div>
          <p className="text-xs text-accent-500 text-center">
            La calidad alta produce mejores detalles pero toma más tiempo y recursos
          </p>
        </div>

        <p className="text-sm text-accent-600 text-center">{description}</p>

        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!isFormValid || isGenerating}
            className="px-12 py-4 text-lg font-semibold"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              <>
                <Icon name={icon} className="w-5 h-5 mr-2" />
                Generar {name}
              </>
            )}
          </Button>
        </div>
      </form>

      <GenerationLoader isVisible={isGenerating} onCancel={handleCancelGeneration} />
      <ResultModal result={result} onClose={handleCloseResult} />
    </>
  );
};

export default GenerateForm;
