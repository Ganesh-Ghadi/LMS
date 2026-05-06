import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Success, Error, BadRequest, NotFound } from "@/lib/api-response";
import { guardApiAccess } from "@/lib/access-guard";
import { z } from "zod";

const updateSchema = z.object({
  serviceName: z.string().min(1, "Service name is required").optional(),
  rate: z.coerce.number().min(0.01, "Rate must be greater than 0").optional(),
});

// GET /api/services/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid ID");

    const service = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        serviceName: true,
        rate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!service) return NotFound("Service not found");

    return Success(service);
  } catch (error) {
    console.error("Get service error:", error);
    return Error("Failed to fetch service");
  }
}

// PATCH /api/services/[id]
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid ID");

    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.service.update({
      where: { id },
      data,
      select: {
        id: true,
        serviceName: true,
        rate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Success(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return BadRequest(error.errors);
    }
    if (error.code === "P2025") {
      return NotFound("Service not found");
    }
    if (error.code === "P2002") {
      return Error("Service name already exists", 409);
    }
    console.error("Update service error:", error);
    return Error("Failed to update service");
  }
}

// DELETE /api/services/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await guardApiAccess(req);
  if (auth.ok === false) return auth.response;

  try {
    const id = parseInt((await context.params).id);
    if (isNaN(id)) return BadRequest("Invalid ID");

    await prisma.service.delete({
      where: { id },
    });

    return Success({ message: "Service deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NotFound("Service not found");
    }
    console.error("Delete service error:", error);
    return Error("Failed to delete service");
  }
}
