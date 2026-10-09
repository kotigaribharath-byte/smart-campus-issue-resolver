import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import { useToast } from '../../hooks/useToast';

export const ImageUploadZone = ({ onImageUploaded, initialImageUrl = '', label = 'Attach Proof / Issue Photo' }) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { error, success } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('File size cannot exceed 5MB');
      return;
    }

    try {
      setUploading(true);
      const data = await uploadService.uploadImage(file);
      if (data.success && data.imageUrl) {
        setImageUrl(data.imageUrl);
        onImageUploaded(data.imageUrl);
        success('Image uploaded successfully.');
      }
    } catch (err) {
      error('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setImageUrl('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </label>

      {imageUrl ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 aspect-video sm:aspect-auto sm:h-48 flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Uploaded Preview"
            className="w-full h-full object-cover rounded-2xl"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-rose-600 text-white rounded-xl shadow-md backdrop-blur-xs transition-all"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
            uploading
              ? 'bg-slate-50 border-indigo-300'
              : 'border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">Uploading & processing image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-indigo-600">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Click or drag image to upload</p>
                <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
