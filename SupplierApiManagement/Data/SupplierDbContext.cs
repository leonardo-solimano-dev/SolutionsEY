using Microsoft.EntityFrameworkCore;
using SupplierApi.Models;

namespace SupplierApi.Data
{
    public class SupplierDbContext : DbContext
    {
        // Constructor: inicializa el contexto con las opciones de configuración
        public SupplierDbContext(DbContextOptions<SupplierDbContext> options)
            : base(options)
        {
        }

        // DbSet para las entidades de proveedores
        public DbSet<SupplierModel> Suppliers { get; set; }
        // DbSet para las entidades de usuarios
        public DbSet<User> Users { get; set; }

        // Configura las restricciones y tipos de datos de las entidades
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SupplierModel>(entity =>
            {
                entity.Property(e => e.LegalName)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.CommercialName)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.TaxId)
                    .IsRequired()
                    .HasMaxLength(11);

                entity.Property(e => e.PhoneNumber)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Website)
                    .HasMaxLength(255);

                entity.Property(e => e.PhysicalAddress)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.Country)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.AnnualBillingUSD)
                    .IsRequired()
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.LastEdited)
                    .IsRequired();
            });
        }
    }
}