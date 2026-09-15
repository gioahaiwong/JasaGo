import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../axiosConfig";
import { ArrowLeft, Upload, Image, Loader2, AlertCircle } from "lucide-react";

type Payment = {
  id: number;
  order_id: number;
  amount: number;
  status: string;
};

export default function PaymentProof() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [proofUrl, setProofUrl] = useState<string>("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submit, setSubmit] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchPayment = async () => {
    if (!orderId) {
      setError("Invalid order ID.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.get(`/api/payments/order/${orderId}`);
      setPayment(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch payment");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [orderId]);

  // Upload file ke server
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("proof", file);

    setUploading(true);
    try {
      const response = await api.post("/api/payments/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = response.data?.url ?? "";
      setProofUrl(url);
      if (url) {
        alert("File berhasil diupload! URL otomatis terisi.");
      } else {
        alert(
          "Upload berhasil tapi URL tidak ditemukan. Silakan masukkan URL manual.",
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal upload file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUploadProof = async () => {
    if (!proofUrl || !proofUrl?.trim()) {
      alert("Silakan upload file atau masukkan URL bukti.");
      return;
    }
    if (!payment) return;
    setSubmit(true);
    try {
      await api.post("/api/payments/upload-proof", {
        payment_id: payment.id,
        proof_url: proofUrl?.trim(),
      });
      alert("Bukti pembayaran terkirim! Menunggu verifikasi admin.");
      navigate("/my-orders");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal upload bukti.");
    } finally {
      setSubmit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/payment/${orderId}`)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition"
          >
            Buat Payment Dulu
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <p className="text-gray-500 mb-6">Payment tidak ditemukan.</p>
          <button
            onClick={() => navigate(`/payment/${orderId}`)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-indigo-100 to-blue-200 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Upload Bukti Transfer
        </h1>

        {/* Informasi Payment */}
        <div className="bg-purple-50 rounded-xl p-4 mb-4 text-sm">
          <p>
            <strong>Payment ID:</strong> #{payment.id}
          </p>
          <p>
            <strong>Jumlah:</strong> Rp {payment.amount.toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong> {payment.status}
          </p>
        </div>

        {/* Upload File */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload File (JPEG/PNG, maks 5MB)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading || submit}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {uploading && (
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            )}
          </div>
        </div>

        {/* Atau masukkan URL manual */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Atau Masukkan URL (Google Drive / Imgur)
          </label>
          <input
            type="text"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            disabled={submit}
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleUploadProof}
            disabled={submit || !proofUrl?.trim()}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submit ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {submit ? "Mengirim..." : "Kirim Bukti"}
          </button>
          <button
            onClick={() => navigate("/my-orders")}
            className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
