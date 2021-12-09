module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'ec2-18-233-177-20.compute-1.amazonaws.com'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'daq8h2spj8vhrq'),
      user: env('DATABASE_USERNAME', 'owfrkkmsjvcnxg'),
      password: env('DATABASE_PASSWORD', '2e107b3c202945f3fa8397d9c9c49ca5dbc9633fa4fe2baa42cd7eda54428d38'),
      ssl: {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
      },
    },
  },
});
