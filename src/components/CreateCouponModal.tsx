"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "./ui/toast-provider";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function CreateCouponModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { Toast, showToast } = useToast();

  const [merchants, setMerchants] = useState<any[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    appliesTo: "SITE",
    merchantId: "",
    startDate: "",
    endDate: "",
    usageLimit: ""
  });

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch merchants when modal opens and appliesTo = MERCHANT
  useEffect(() => {
    if (open && formData.appliesTo === "MERCHANT") {
      fetchMerchants();
    }
  }, [open, formData.appliesTo]);

  const fetchMerchants = async () => {
    try {
      setLoadingMerchants(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/api/v1/stores/`, {
        headers: {
          "Content-Type": "application/json",
          "cushy-access-key": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setMerchants(data?.data || []);
      } else {
        showToast("Failed to load merchants");
      }
    } catch (error) {
      showToast("Error loading merchants");
    } finally {
      setLoadingMerchants(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const payload = {
        code: formData.code,
        type: formData.type,
        value: Number(formData.value),
        appliesTo:
          formData.appliesTo === "SITE"
            ? "SITE"
            : formData.merchantId, // Merchant ID sent directly
        startDate: formData.startDate,
        endDate: formData.endDate,
        usageLimit: Number(formData.usageLimit),
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/promo-code/create-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cushy-access-key": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data?.message || "Error creating coupon");
        return;
      }

      showToast("Coupon created successfully");
      setOpen(false);
    } catch (error) {
      showToast("Error creating coupon");
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#5B2C6F] hover:bg-[#4A2359] text-white px-4 py-2 cursor-pointer"
      >
        Create Coupon
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Code</Label>
              <Input name="code" value={formData.code} onChange={handleChange} />
            </div>

            <div>
              <Label>Type</Label>
              <select
                name="type"
                className="w-full border rounded-md p-2"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="PERCENT">PERCENT</option>
                <option value="FIXED">FIXED</option>
              </select>
            </div>

            <div>
              <Label>Value</Label>
              <Input type="number" name="value" value={formData.value} onChange={handleChange} />
            </div>

            <div>
              <Label>Applies To</Label>
              <select
                name="appliesTo"
                className="w-full border rounded-md p-2"
                value={formData.appliesTo}
                onChange={handleChange}
              >
                <option value="SITE">SITE</option>
                <option value="MERCHANT">MERCHANT</option>
              </select>
            </div>

            {formData.appliesTo === "MERCHANT" && (
              <div>
                <Label>Select Merchant</Label>

                <select
                  name="merchantId"
                  className="w-full border rounded-md p-2"
                  value={formData.merchantId}
                  onChange={handleChange}
                >
                  <option value="">-- Select Merchant --</option>

                  {loadingMerchants ? (
                    <option>Loading...</option>
                  ) : (
                    merchants.map((merchant) => (
                      <option key={merchant.id} value={merchant.id}>
                        {merchant.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            <div>
              <Label>Start Date</Label>
              <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
            </div>

            <div>
              <Label>End Date</Label>
              <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
            </div>

            <div>
              <Label>Usage Limit</Label>
              <Input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
              />
            </div>
          </div>

          {Toast}

          <DialogFooter>
          <DialogFooter>
  <Button
    onClick={() => setOpen(false)}
    variant="ghost"
    className="cursor-pointer"
  >
    Cancel
  </Button>

  <Button
    onClick={handleSubmit}
    disabled={loading}
    className="cursor-pointer"
  >
    {loading ? "Creating..." : "Create"}
  </Button>
</DialogFooter>


          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
